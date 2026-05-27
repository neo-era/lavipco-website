import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { removeVietnameseAccents } from "@/lib/utils";
import {
  PRODUCTS_PAGE_SIZE,
  buildProductsUrl,
  getOrderBy,
  parseFilters,
  parseSort,
  parseViewMode,
} from "@/lib/products-data";
import { Container } from "@/components/layout/Container";
import { Pagination } from "@/components/common/Pagination";
import { ProductsHero } from "@/components/product/ProductsHero";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import {
  ProductFilters,
  type CategoryNode,
} from "@/components/product/ProductFilters";
import { ProductSortDropdown } from "@/components/product/ProductSort";
import { ViewToggle } from "@/components/product/ViewToggle";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
  view?: string;
  page?: string;
};

/**
 * Canonical strategy:
 *  - Trang gốc /products: canonical /products.
 *  - Paginated (page=2): canonical /products?page=2 (mỗi trang là duy nhất với Google).
 *  - Filter (category/brand/q): canonical /products → tránh duplicate content khi
 *    crawler hit nhiều URL filter khác nhau với cùng content.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const titleSuffix = page > 1 ? ` - Trang ${page}` : "";
  const canonical = page > 1 ? `/products?page=${page}` : "/products";

  return {
    title: `Sản phẩm${titleSuffix}`,
    description:
      "Catalog thiết bị chiếu sáng và điều khiển: đèn LED đường phố, đèn tín hiệu giao thông, đèn pha cảnh quan, tủ điều khiển và phụ kiện.",
    alternates: { canonical },
    openGraph: {
      title: `Sản phẩm${titleSuffix} | ${SITE_CONFIG.name}`,
      description: SITE_CONFIG.description,
      url: canonical,
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters = parseFilters(sp);
  const sort = parseSort(sp.sort);
  const view = parseViewMode(sp.view);
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * PRODUCTS_PAGE_SIZE;

  // Build Prisma where
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.brands.length > 0) where.brand = { in: filters.brands };
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    where.basePrice = {
      ...(filters.minPrice !== null && { gte: filters.minPrice }),
      ...(filters.maxPrice !== null && { lte: filters.maxPrice }),
    };
  }
  if (filters.q) {
    const qNoAccent = removeVietnameseAccents(filters.q);
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { nameNoAccent: { contains: qNoAccent, mode: "insensitive" } },
      { shortDescription: { contains: filters.q, mode: "insensitive" } },
      { brand: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  // Parallel: data + count + sidebar data
  const [rawProducts, total, categories, brandRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip,
      take: PRODUCTS_PAGE_SIZE,
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isDefault: true,
          },
        },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, parentId: true },
    }),
    db.product.findMany({
      where: { status: "ACTIVE", brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));

  // Convert Decimal sang number cho client
  const products: ProductCardData[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    brand: p.brand,
    basePrice: Number(p.basePrice),
    priceOnRequest: p.priceOnRequest,
    isFeatured: p.isFeatured,
    images: p.images,
    createdAt: p.createdAt,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      stock: v.stock,
      isDefault: v.isDefault,
    })),
  }));

  // Build category tree từ flat list
  const categoryTree = buildCategoryTree(categories);
  const brands = brandRows.map((r) => r.brand!).filter(Boolean);

  // URL builder cho Pagination (giữ nguyên các filter/sort/view hiện tại)
  const buildPageUrl = (p: number) =>
    buildProductsUrl({ filters, sort, view, page: p });

  return (
    <>
      <ProductsHero totalProducts={total} />

      <section className="py-10 md:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <ProductFilters
              categories={categoryTree}
              brands={brands}
              initial={filters}
            />

            <div>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
                <p className="text-sm text-muted-foreground">
                  {total === 0
                    ? "Không có sản phẩm phù hợp"
                    : `Hiển thị ${skip + 1}–${skip + products.length} trên tổng ${total} sản phẩm`}
                </p>
                <div className="flex items-center gap-2">
                  <ProductSortDropdown />
                  <ViewToggle />
                </div>
              </div>

              {/* Empty state */}
              {products.length === 0 ? (
                <div className="rounded-lg border bg-card py-16 text-center text-muted-foreground">
                  Thử bỏ bớt bộ lọc để xem thêm sản phẩm.
                </div>
              ) : view === "list" ? (
                <div className="space-y-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} view="list" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} view="grid" />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    buildPageUrl={buildPageUrl}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * Build cây phân cấp Category từ flat list.
 * Categories không có parent → root. Có parentId → con của root.
 */
function buildCategoryTree(
  flat: Array<{ slug: string; name: string; parentId: string | null }>,
): CategoryNode[] {
  // Hiện seed flat → tất cả parentId = null. Khi có hierarchy:
  const bySlug = new Map(flat.map((c) => [c.slug, { ...c, children: [] as CategoryNode[] }]));
  // Note: parentId lưu id chứ không phải slug → ta giữ phẳng theo slug và bỏ qua hierarchy nếu cần.
  // Hiện tại seed không có parent nên trả flat list.
  return Array.from(bySlug.values()).map(({ slug, name, children }) => ({
    slug,
    name,
    children: children.length > 0 ? children : undefined,
  }));
}

import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";
import { removeVietnameseAccents } from "@/lib/utils";
import { ADMIN_TABLE_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/Pagination";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import {
  AdminProductTable,
  type AdminProductRow,
} from "@/components/admin/AdminProductTable";
import { ImportDialog } from "@/components/admin/shared/ImportDialog";
import { previewImportProduct, runImportProduct } from "@/lib/actions/admin-product-import";

export const metadata: Metadata = { title: "Sản phẩm" };

// Admin list không cache
export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  categoryId?: string;
  status?: string;
  featured?: string;
  page?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = sp.q?.trim() ?? "";
  const categoryId = sp.categoryId && sp.categoryId !== "ALL" ? sp.categoryId : "ALL";
  const status = sp.status && sp.status !== "ALL" ? sp.status : "ALL";
  const featured = sp.featured && sp.featured !== "ALL" ? sp.featured : "ALL";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  // Build Prisma where
  const where: Prisma.ProductWhereInput = {};
  if (categoryId !== "ALL") where.categoryId = categoryId;
  if (status !== "ALL")
    where.status = status as "DRAFT" | "ACTIVE" | "ARCHIVED";
  if (featured === "YES") where.isFeatured = true;
  if (featured === "NO") where.isFeatured = false;
  if (q) {
    const qNoAccent = removeVietnameseAccents(q);
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { nameNoAccent: { contains: qNoAccent, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
    ];
  }

  // Parallel: list + count + categories cho filter dropdown
  const [rawProducts, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));

  const rows: AdminProductRow[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    categoryName: p.category.name,
    basePrice: Number(p.basePrice),
    priceOnRequest: p.priceOnRequest,
    status: p.status,
    isFeatured: p.isFeatured,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    variantCount: p.variants.length,
    cover: p.images[0] ?? null,
    createdAt: p.createdAt,
  }));

  // URL builder cho pagination — giữ nguyên các filter
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId !== "ALL") params.set("categoryId", categoryId);
    if (status !== "ALL") params.set("status", status);
    if (featured !== "ALL") params.set("featured", featured);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý catalog: danh mục, biến thể, ảnh, thông số và trạng thái hiển thị.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportDialog
            entityLabel="Sản phẩm"
            templateHref="/api/admin/templates/products"
            onParse={previewImportProduct}
            onConfirm={runImportProduct}
          />
          <Button asChild variant="brand">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AdminProductFilters
        categories={categories}
        initial={{ q, categoryId, status, featured }}
      />

      {/* Summary count */}
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Không tìm thấy sản phẩm phù hợp."
          : `Hiển thị ${skip + 1}–${skip + rows.length} trên tổng ${total} sản phẩm`}
      </p>

      {/* Table */}
      <AdminProductTable rows={rows} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildPageUrl={buildPageUrl}
          />
        </div>
      )}
    </div>
  );
}

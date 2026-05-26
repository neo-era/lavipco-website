import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  ProductInfo,
  type ProductInfoVariant,
} from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductRelated } from "@/components/product/ProductRelated";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";

export const revalidate = 60;
export const dynamicParams = true;

type RouteParams = { slug: string };

/**
 * Prerender SSG top sản phẩm phổ biến.
 * "Phổ biến" tạm hiểu là: featured + 20 mới nhất ACTIVE.
 * Slug khác sẽ on-demand SSG (dynamicParams=true).
 */
export async function generateStaticParams(): Promise<RouteParams[]> {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    take: 20,
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      images: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!product) {
    return { title: "Không tìm thấy sản phẩm", robots: { index: false } };
  }

  const title = product.metaTitle || product.name;
  const description = (
    product.metaDescription ||
    product.shortDescription ||
    product.description ||
    `${product.name} - LAVIPCO`
  ).slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.name} | ${SITE_CONFIG.name}`,
      description,
      url: `/products/${slug}`,
      type: "website",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      images: product.images[0]
        ? [{ url: product.images[0], width: 1200, height: 630, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      variants: {
        orderBy: [{ isDefault: "desc" }, { price: "asc" }],
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  // Convert Decimal → number cho client components
  const variants: ProductInfoVariant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    name: v.name,
    price: Number(v.price),
    stock: v.stock,
    isDefault: v.isDefault,
  }));

  const basePrice = Number(product.basePrice);

  return (
    <>
      {/* Breadcrumb */}
      <section className="border-b bg-muted/20">
        <Container className="py-4">
          <Breadcrumb
            items={[
              { title: "Sản phẩm", href: "/products" },
              {
                title: product.category.name,
                href: `/products?category=${product.category.slug}`,
              },
              { title: product.name },
            ]}
          />
        </Container>
      </section>

      {/* Phần trên: Gallery + Info */}
      <section className="py-10 md:py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <ProductGallery images={product.images} name={product.name} />
            <ProductInfo
              product={{
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                shortDescription: product.shortDescription,
                basePrice,
                priceOnRequest: product.priceOnRequest,
                isFeatured: product.isFeatured,
                images: product.images,
                catalogueUrl: product.catalogueUrl,
              }}
              variants={variants}
            />
          </div>
        </Container>
      </section>

      {/* Tabs */}
      <section className="border-t py-12 md:py-16">
        <Container>
          <ProductTabs
            description={product.description}
            specs={product.specs}
            catalogueUrl={product.catalogueUrl}
          />
        </Container>
      </section>

      {/* Sản phẩm liên quan */}
      <ProductRelated
        categoryId={product.categoryId}
        categorySlug={product.category.slug}
        excludeProductId={product.id}
      />

      {/* Sản phẩm đã xem - track + render từ localStorage */}
      <RecentlyViewed
        current={{
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          price: basePrice,
          priceOnRequest: product.priceOnRequest,
        }}
      />
    </>
  );
}

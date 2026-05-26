import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "./ProductCard";

/**
 * "Sản phẩm liên quan" - 4 sản phẩm cùng category, trừ sản phẩm hiện tại.
 */
export async function ProductRelated({
  categoryId,
  categorySlug,
  excludeProductId,
}: {
  categoryId: string;
  categorySlug: string;
  excludeProductId: string;
}) {
  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId,
      id: { not: excludeProductId },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
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
  });

  if (products.length === 0) return null;

  // Convert Decimal → number cho ProductCard (client-friendly)
  const cards: ProductCardData[] = products.map((p) => ({
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

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="brand" className="mb-3 rounded-full">
              Cùng danh mục
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Sản phẩm liên quan
            </h2>
          </div>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href={`/products?category=${categorySlug}`}>
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.id} product={p} view="grid" />
          ))}
        </div>
      </Container>
    </section>
  );
}

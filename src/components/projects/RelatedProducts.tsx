import Link from "next/link";
import Image from "next/image";
import { Package, ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Sản phẩm liên quan tới dự án — query theo product category slug mapping
 * từ ProjectCategory. Ẩn nếu không có sản phẩm.
 */
export async function RelatedProducts({
  productCategorySlug,
}: {
  productCategorySlug: string | null;
}) {
  if (!productCategorySlug) return null;

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      category: { slug: productCategorySlug },
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    take: 4,
  });

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="brand" className="mb-3 rounded-full">
              Sản phẩm liên quan
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Thiết bị thường dùng cho dự án này
            </h2>
          </div>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href={`/products?category=${productCategorySlug}`}>
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const cover = p.images[0];
            const priceText = p.priceOnRequest
              ? "Liên hệ"
              : formatCurrency(Number(p.basePrice));
            return (
              <Card key={p.id} className="flex h-full flex-col overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover hover:scale-105 transition"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-primary/40">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <CardContent className="flex-1 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    <Link href={`/products/${p.slug}`} className="hover:text-brand-primary">
                      {p.name}
                    </Link>
                  </h3>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <span className="text-sm font-bold text-brand-primary">{priceText}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${p.slug}`}>Chi tiết</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

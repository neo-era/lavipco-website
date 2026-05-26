import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";

import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Section "Sản phẩm nổi bật" — Server Component.
 * Lấy isFeatured=true trước; nếu chưa đủ 8 thì fill thêm sản phẩm mới nhất.
 */
export async function FeaturedProducts() {
  const featured = await db.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  let products = featured;
  if (products.length < 8) {
    const fill = await db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: featured.map((p) => p.id) },
      },
      orderBy: { createdAt: "desc" },
      take: 8 - featured.length,
    });
    products = [...featured, ...fill];
  }

  if (products.length === 0) return null;

  return (
    <section id="featured-products" className="py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="brand" className="mb-3 rounded-full">
              Sản phẩm
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-2 text-muted-foreground">
              Các thiết bị được lựa chọn nhiều cho dự án chiếu sáng đô thị và giao thông.
            </p>
          </div>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href="/products">
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
              <Card
                key={p.id}
                className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-primary/40">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-4">
                  {p.brand && (
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {p.brand}
                    </div>
                  )}
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight">
                    <Link href={`/products/${p.slug}`} className="hover:text-brand-primary">
                      {p.name}
                    </Link>
                  </h3>
                  {p.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.shortDescription}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4 pt-0">
                  <div className="text-base font-bold text-brand-primary">{priceText}</div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${p.slug}`}>Xem chi tiết</Link>
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

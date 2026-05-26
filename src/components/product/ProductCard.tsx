import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { isNewProduct } from "@/lib/products-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "./AddToCartButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  brand?: string | null;
  basePrice: number; // converted từ Decimal trước khi pass vào (server component)
  priceOnRequest: boolean;
  isFeatured: boolean;
  images: string[];
  createdAt: Date;
  variants: Array<{
    id: string;
    name: string | null;
    price: number;
    stock: number;
    isDefault: boolean;
  }>;
};

type Props = {
  product: ProductCardData;
  view?: "grid" | "list";
};

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

export function ProductCard({ product, view = "grid" }: Props) {
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = totalStock === 0 && !product.priceOnRequest;
  const isNew = isNewProduct(product.createdAt);
  const priceText = product.priceOnRequest
    ? "Liên hệ"
    : formatCurrency(product.basePrice);
  const cover = product.images[0];

  if (view === "list") {
    return (
      <Card className="group flex flex-col gap-4 overflow-hidden p-4 transition-shadow hover:shadow-md sm:flex-row sm:gap-6 sm:p-5">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 sm:aspect-square sm:w-48 sm:shrink-0">
          <CoverImage cover={cover} name={product.name} />
          <BadgesOverlay isNew={isNew} isFeatured={product.isFeatured} outOfStock={outOfStock} />
        </div>
        <div className="flex flex-1 flex-col">
          {product.brand && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </div>
          )}
          <h3 className="mt-1 text-base font-semibold leading-tight md:text-lg">
            <Link href={`/products/${product.slug}`} className="hover:text-brand-primary">
              {product.name}
            </Link>
          </h3>
          {product.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="text-lg font-bold text-brand-primary">{priceText}</div>
            {defaultVariant && (
              <AddToCartButton
                productVariantId={defaultVariant.id}
                productSlug={product.slug}
                productName={product.name}
                variantName={defaultVariant.name}
                unitPrice={defaultVariant.price}
                image={cover}
                priceOnRequest={product.priceOnRequest}
                outOfStock={outOfStock}
                size="default"
              />
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
        <CoverImage cover={cover} name={product.name} />
        <BadgesOverlay isNew={isNew} isFeatured={product.isFeatured} outOfStock={outOfStock} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </div>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
          <Link href={`/products/${product.slug}`} className="hover:text-brand-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-3">
          <div className="text-base font-bold text-brand-primary">{priceText}</div>
          {defaultVariant && (
            <div className="mt-3">
              <AddToCartButton
                productVariantId={defaultVariant.id}
                productSlug={product.slug}
                productName={product.name}
                variantName={defaultVariant.name}
                unitPrice={defaultVariant.price}
                image={cover}
                priceOnRequest={product.priceOnRequest}
                outOfStock={outOfStock}
                size="sm"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CoverImage({ cover, name }: { cover?: string; name: string }) {
  if (!cover) {
    return (
      <div className="flex h-full items-center justify-center text-brand-primary/40">
        <Package className="h-12 w-12" />
      </div>
    );
  }
  return (
    <Image
      src={cover}
      alt={name}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
    />
  );
}

function BadgesOverlay({
  isNew,
  isFeatured,
  outOfStock,
}: {
  isNew: boolean;
  isFeatured: boolean;
  outOfStock: boolean;
}) {
  return (
    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
      {outOfStock && (
        <Badge variant="destructive" className={cn("rounded-full text-[10px]")}>
          Hết hàng
        </Badge>
      )}
      {isFeatured && (
        <Badge variant="accent" className="rounded-full text-[10px]">
          Nổi bật
        </Badge>
      )}
      {isNew && (
        <Badge variant="brand" className="rounded-full text-[10px]">
          Mới
        </Badge>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, Phone, Package } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { isNewProduct } from "@/lib/products-data";
import { removeFromWishlist } from "@/lib/actions/wishlist";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

export type WishlistItemView = {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  basePrice: number;
  priceOnRequest: boolean;
  image: string | null;
  createdAt: Date; // của Product, dùng cho badge "Mới"
  /** Default variant để add to cart. null nếu out of stock. */
  variant: {
    id: string;
    name: string | null;
    price: number;
    stock: number;
  } | null;
};

export function WishlistGrid({ items }: { items: WishlistItemView[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card py-16 text-center">
        <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Bạn chưa có sản phẩm yêu thích. Click vào ❤️ trên sản phẩm để thêm.
        </p>
        <Button asChild variant="brand" size="sm" className="mt-4">
          <Link href="/products">Khám phá sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <WishlistCard key={item.productId} item={item} />
      ))}
    </div>
  );
}

function WishlistCard({ item }: { item: WishlistItemView }) {
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const [removing, setRemoving] = React.useState(false);

  const outOfStock = !item.variant || item.variant.stock === 0;
  const isNew = isNewProduct(item.createdAt);

  async function handleRemove() {
    setRemoving(true);
    const result = await removeFromWishlist(item.productId);
    setRemoving(false);
    if (!result.ok) {
      toast({
        title: "Không xoá được",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Đã xoá khỏi yêu thích" });
  }

  function handleAddToCart() {
    if (!item.variant || item.priceOnRequest || outOfStock) return;
    addItem({
      productVariantId: item.variant.id,
      productSlug: item.slug,
      productName: item.name,
      variantName: item.variant.name,
      unitPrice: item.variant.price,
      maxStock: item.variant.stock,
      image: item.image ?? undefined,
      quantity: 1,
    });
    toast({
      title: "✓ Đã thêm vào giỏ",
      description: item.name,
    });
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-primary/40">
            <Package className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {outOfStock && (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Hết hàng
            </Badge>
          )}
          {isNew && !outOfStock && (
            <Badge variant="brand" className="rounded-full text-[10px]">
              Mới
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          aria-label="Xoá khỏi yêu thích"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {item.brand && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
          <Link href={`/products/${item.slug}`} className="hover:text-brand-primary">
            {item.name}
          </Link>
        </h3>
        <div className="mt-auto pt-3">
          <p className="text-base font-bold text-brand-primary">
            {item.priceOnRequest ? "Liên hệ" : formatCurrency(item.basePrice)}
          </p>
          <div className="mt-3">
            {item.priceOnRequest ? (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/contact?type=quotation">
                  <Phone className="h-3.5 w-3.5" />
                  Liên hệ
                </Link>
              </Button>
            ) : outOfStock ? (
              <Button variant="outline" size="sm" disabled className="w-full">
                Hết hàng
              </Button>
            ) : (
              <Button
                variant="brand"
                size="sm"
                onClick={handleAddToCart}
                className="w-full"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Thêm vào giỏ
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

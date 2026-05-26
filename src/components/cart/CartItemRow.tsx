"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Minus, Plus, X } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

type Props = {
  item: CartItem;
};

/**
 * Một row trong giỏ hàng: ảnh + tên (link) + variant + đơn giá + qty ± + thành tiền + xoá.
 * Responsive: mobile stack dọc, desktop grid hàng ngang.
 */
export function CartItemRow({ item }: Props) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { toast } = useToast();

  const lineTotal = item.unitPrice * item.quantity;

  function handleQty(next: number) {
    const result = updateQuantity(item.productVariantId, next);
    if (result.clamped) {
      toast({
        title: "Đã đạt giới hạn tồn kho",
        description: `Chỉ còn ${item.maxStock} sản phẩm cho biến thể này.`,
        variant: "destructive",
      });
    }
  }

  function handleRemove() {
    removeItem(item.productVariantId);
    toast({
      title: "Đã xoá khỏi giỏ hàng",
      description: item.productName,
    });
  }

  return (
    <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-5">
      {/* Image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="relative aspect-square w-24 overflow-hidden rounded-md bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 sm:w-full"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            sizes="96px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-primary/40">
            <Package className="h-10 w-10" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="font-semibold leading-tight">
          <Link href={`/products/${item.productSlug}`} className="hover:text-brand-primary">
            {item.productName}
          </Link>
        </h3>
        {item.variantName && (
          <p className="text-xs text-muted-foreground">{item.variantName}</p>
        )}
        <p className="text-sm">
          <span className="text-muted-foreground">Đơn giá: </span>
          <span className="font-medium text-foreground">{formatCurrency(item.unitPrice)}</span>
        </p>

        {/* Qty + Remove cho mobile (gọn) */}
        <div className="flex items-center gap-3 pt-2 sm:hidden">
          <QtyControl
            quantity={item.quantity}
            maxStock={item.maxStock}
            onChange={handleQty}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
            Xoá
          </Button>
        </div>
      </div>

      {/* Qty + Total + Remove desktop */}
      <div className="hidden flex-col items-end gap-3 sm:flex">
        <QtyControl
          quantity={item.quantity}
          maxStock={item.maxStock}
          onChange={handleQty}
        />
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Thành tiền</p>
          <p className="text-base font-bold text-brand-primary">
            {formatCurrency(lineTotal)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-destructive hover:text-destructive"
          aria-label="Xoá sản phẩm"
        >
          <X className="h-3.5 w-3.5" />
          Xoá
        </Button>
      </div>

      {/* Thành tiền cho mobile (hiển thị riêng dưới) */}
      <div className="flex items-center justify-between border-t pt-3 sm:hidden">
        <span className="text-xs text-muted-foreground">Thành tiền</span>
        <span className="text-base font-bold text-brand-primary">
          {formatCurrency(lineTotal)}
        </span>
      </div>
    </div>
  );
}

function QtyControl({
  quantity,
  maxStock,
  onChange,
}: {
  quantity: number;
  maxStock: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none"
        onClick={() => onChange(quantity - 1)}
        aria-label="Giảm số lượng"
        disabled={quantity <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        min={1}
        max={maxStock}
        value={quantity}
        onChange={(event) => {
          const n = Number(event.target.value) || 1;
          onChange(n);
        }}
        className="h-8 w-12 rounded-none border-x border-y-0 text-center text-sm [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none"
        onClick={() => onChange(quantity + 1)}
        aria-label="Tăng số lượng"
        disabled={quantity >= maxStock}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

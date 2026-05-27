"use client";

import Image from "next/image";
import { Package } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { VAT_RATE } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { Badge } from "@/components/ui/badge";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

type Props = {
  discountAmount: number;
  /** Phí ship - hiện tạm placeholder "Tính khi đặt hàng". Sau createOrder mới biết chính xác. */
  shippingFeePlaceholder?: string;
};

export function CheckoutSummary({
  discountAmount,
  shippingFeePlaceholder = "Tính khi đặt hàng",
}: Props) {
  const items = useCartStore((s) => s.items);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vatAmount = (subtotal * VAT_RATE) / (1 + VAT_RATE);
  // Total chưa biết ship → hiển thị "subtotal - discount + ship tính sau"
  const totalKnown = subtotal - discountAmount;

  return (
    <aside className="sticky top-24 space-y-5 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>
        <Badge variant="outline" className="mt-1 rounded-full text-xs">
          {items.length} sản phẩm
        </Badge>
      </div>

      {/* Items list */}
      <ul className="space-y-3 border-y py-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-primary/40">
                  <Package className="h-6 w-6" />
                </div>
              )}
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-card bg-brand-primary px-1 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-tight">
                {item.productName}
              </p>
              {item.variantName && (
                <p className="text-[11px] text-muted-foreground">{item.variantName}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold">
              {formatCurrency(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Pricing */}
      <dl className="space-y-2.5 text-sm">
        <Row label="Tạm tính" value={formatCurrency(subtotal)} />
        <Row label="Trong đó VAT 10%" value={formatCurrency(vatAmount)} muted />
        {discountAmount > 0 && (
          <Row
            label="Giảm giá"
            value={`-${formatCurrency(discountAmount)}`}
            valueClass="text-green-600 font-medium"
          />
        )}
        <Row
          label="Phí vận chuyển"
          value={shippingFeePlaceholder}
          valueClass="text-muted-foreground italic"
        />
      </dl>

      <div className="border-t pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Tạm tổng cộng</span>
          <span className="text-xl font-bold text-brand-primary">
            {formatCurrency(totalKnown)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          + phí vận chuyển sẽ cộng vào sau khi xác nhận
        </p>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  muted,
  valueClass,
}: {
  label: string;
  value: string;
  muted?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={muted ? "text-xs text-muted-foreground" : "text-foreground/80"}>
        {label}
      </dt>
      <dd
        className={
          valueClass ?? (muted ? "text-xs text-muted-foreground" : "font-medium")
        }
      >
        {value}
      </dd>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import {
  useCartSubtotal,
  useCartTotalAmount,
  useCartVatAmount,
  useCartTotalItems,
} from "@/store/cart";
import { Button } from "@/components/ui/button";

/**
 * Tóm tắt đơn hàng ở /cart - Server Component không phù hợp vì cần Zustand client.
 * Hiển thị các dòng: Tạm tính (đã VAT), VAT 10% extracted info, Phí ship placeholder,
 * Tổng cộng. Nút "Tiến hành thanh toán" disabled khi giỏ trống.
 */
export function CartSummary() {
  const subtotal = useCartSubtotal();
  const vatAmount = useCartVatAmount();
  const total = useCartTotalAmount(0); // shippingFee=0 vì tính ở checkout
  const totalItems = useCartTotalItems();

  const isEmpty = totalItems === 0;

  return (
    <aside className="sticky top-24 space-y-5 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-brand-primary" />
        <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>
      </div>

      <dl className="space-y-3 text-sm">
        <Row label={`Tạm tính (${totalItems} sản phẩm)`} value={formatCurrency(subtotal)} />
        <Row
          label="Trong đó VAT 10%"
          value={formatCurrency(vatAmount)}
          muted
        />
        <Row
          label="Phí vận chuyển"
          value="Tính ở bước tiếp theo"
          valueClass="text-muted-foreground italic"
        />
      </dl>

      <div className="border-t pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Tổng cộng</span>
          <span className="text-2xl font-bold text-brand-primary">
            {formatCurrency(total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          (Đã bao gồm VAT, chưa bao gồm phí vận chuyển)
        </p>
      </div>

      <div className="space-y-2">
        <Button
          asChild
          size="lg"
          variant="brand"
          className="w-full"
          disabled={isEmpty}
        >
          <Link href="/checkout" aria-disabled={isEmpty}>
            Tiến hành thanh toán
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
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

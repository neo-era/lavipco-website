"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Tag, X, Loader2, Check } from "lucide-react";

import type { CheckoutInput } from "@/lib/validations/checkout";
import { validateCoupon, type CouponValidation } from "@/lib/actions/coupon";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  /** Subtotal (đã VAT) hiện tại của giỏ. Khi áp coupon, server check min/percent dựa vào số này. */
  subtotal: number;
  /** Callback parent biết coupon đã áp + discountAmount để cập nhật summary. */
  onApplied: (result: { code: string; discountAmount: number } | null) => void;
};

/**
 * Input mã giảm giá inline. Click "Áp dụng" → validateCoupon Server Action.
 * Hiển thị trạng thái: idle / loading / success (chip) / error.
 */
export function CouponInput({ subtotal, onApplied }: Props) {
  const form = useFormContext<CheckoutInput>();
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [applied, setApplied] = React.useState<
    | { code: string; discountAmount: number; description?: string }
    | null
  >(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleApply(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || pending) return;

    setPending(true);
    setError(null);

    const result: CouponValidation = await validateCoupon(code, subtotal);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      setApplied(null);
      form.setValue("couponCode", undefined);
      onApplied(null);
      return;
    }

    setApplied({
      code: result.code,
      discountAmount: result.discountAmount,
      description: result.description,
    });
    form.setValue("couponCode", result.code);
    onApplied({ code: result.code, discountAmount: result.discountAmount });
  }

  function handleRemove() {
    setApplied(null);
    setError(null);
    setCode("");
    form.setValue("couponCode", undefined);
    onApplied(null);
  }

  if (applied) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="flex-1 text-sm font-medium">
            Đã áp mã{" "}
            <span className="rounded bg-green-500/15 px-1.5 py-0.5 font-mono text-xs text-green-700">
              {applied.code}
            </span>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Bỏ áp mã giảm giá"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-green-700">
          Giảm: -{formatCurrency(applied.discountAmount)}
        </p>
        {applied.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{applied.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={pending}
            className="pl-9 uppercase"
          />
        </div>
        <Button type="submit" variant="outline" disabled={pending || !code.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
        </Button>
      </form>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

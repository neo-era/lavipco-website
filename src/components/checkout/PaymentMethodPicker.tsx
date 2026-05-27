"use client";

import { useFormContext } from "react-hook-form";
import { Banknote, Wallet, CreditCard, Building } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { PAYMENT_METHODS, type PaymentMethodKey } from "@/lib/validations/checkout";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const METHODS: Array<{
  value: PaymentMethodKey;
  label: string;
  description: string;
  Icon: LucideIcon;
  badge?: string;
}> = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt khi nhận hàng. Phí thu hộ theo nhà vận chuyển.",
    Icon: Banknote,
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản theo số tài khoản LAVIPCO sau khi đặt hàng.",
    Icon: Building,
  },
  {
    value: "VNPAY",
    label: "VNPay",
    description: "Thanh toán qua cổng VNPay (ATM/QR/Visa).",
    Icon: CreditCard,
  },
  {
    value: "MOMO",
    label: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo.",
    Icon: Wallet,
    badge: "Sắp ra mắt",
  },
];

export function PaymentMethodPicker() {
  const form = useFormContext<CheckoutInput>();

  return (
    <FormField
      control={form.control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">
            Phương thức thanh toán
          </FormLabel>
          <FormControl>
            <div className="space-y-2" role="radiogroup">
              {METHODS.map((m) => {
                const active = field.value === m.value;
                const disabled = m.value === "MOMO";
                return (
                  <label
                    key={m.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      active && "border-brand-primary bg-brand-primary/5",
                      disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.value}
                      checked={active}
                      onChange={(e) =>
                        field.onChange(e.target.value as PaymentMethodKey)
                      }
                      disabled={disabled}
                      className="mt-1 h-4 w-4 accent-brand-primary"
                    />
                    <m.Icon
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        active ? "text-brand-primary" : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.label}</span>
                        {m.badge && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { PAYMENT_METHODS };

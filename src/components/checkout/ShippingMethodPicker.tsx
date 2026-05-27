"use client";

import { useFormContext } from "react-hook-form";
import { Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { SHIPPING_METHODS, type ShippingMethodKey } from "@/lib/validations/checkout";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const METHODS: Array<{
  value: ShippingMethodKey;
  label: string;
  description: string;
}> = [
  {
    value: "GHN",
    label: "Giao Hàng Nhanh (GHN)",
    description: "Giao tiêu chuẩn toàn quốc, 1-3 ngày làm việc.",
  },
  {
    value: "GHTK",
    label: "Giao Hàng Tiết Kiệm (GHTK)",
    description: "Giá rẻ, 2-5 ngày làm việc.",
  },
];

export function ShippingMethodPicker() {
  const form = useFormContext<CheckoutInput>();

  return (
    <FormField
      control={form.control}
      name="shippingMethod"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-base font-semibold">
            Phương thức vận chuyển
          </FormLabel>
          <FormControl>
            <div className="space-y-2" role="radiogroup">
              {METHODS.map((m) => {
                const active = field.value === m.value;
                return (
                  <label
                    key={m.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                      active && "border-brand-primary bg-brand-primary/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={m.value}
                      checked={active}
                      onChange={(e) =>
                        field.onChange(e.target.value as ShippingMethodKey)
                      }
                      className="mt-1 h-4 w-4 accent-brand-primary"
                    />
                    <Truck
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        active ? "text-brand-primary" : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{m.label}</div>
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
          <p className="text-xs text-muted-foreground">
            Phí vận chuyển sẽ được tính khi xác nhận đơn hàng.
          </p>
        </FormItem>
      )}
    />
  );
}

export { SHIPPING_METHODS };

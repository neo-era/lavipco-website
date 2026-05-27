"use client";

/**
 * Form Coupon CRUD - 1 card duy nhất (đơn giản hơn product form).
 *  - Code: uppercase auto + button Generate (random 8 chars A-Z0-9)
 *  - Type: PERCENT/FIXED — đổi label/hint value theo type
 *  - Date range: 2 input type=date
 *  - Sticky save bar dưới
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, RefreshCw } from "lucide-react";

import {
  couponInputSchema,
  type CouponInput,
} from "@/lib/validations/admin-coupon";
import {
  createCoupon,
  updateCoupon,
} from "@/lib/actions/admin-coupons";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type Props = {
  mode: "create" | "edit";
  couponId?: string;
  defaultValues: CouponInput;
  usedCount?: number;
};

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ 0, O, I, 1 dễ nhầm

function generateCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

export function AdminCouponForm({
  mode,
  couponId,
  defaultValues,
  usedCount = 0,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CouponInput>({
    resolver: zodResolver(couponInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const type = form.watch("type");

  async function onSubmit(values: CouponInput) {
    const result =
      mode === "create"
        ? await createCoupon(values)
        : await updateCoupon(couponId!, values);

    if (!result.ok) {
      if (result.fieldErrors) {
        (Object.entries(result.fieldErrors) as [keyof CouponInput, string[]][]).forEach(
          ([field, msgs]) => {
            if (msgs?.[0]) form.setError(field, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo coupon thất bại" : "Cập nhật thất bại",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "create" ? "✓ Đã tạo coupon" : "✓ Đã cập nhật coupon",
      description: values.code,
    });

    if (mode === "create") {
      router.push("/admin/coupons");
    } else {
      router.refresh();
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 pb-24"
        >
          <Card className="space-y-5 p-5">
            {/* Code + generate */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã coupon <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: SALE2026, FREESHIP"
                        className="font-mono uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const code = generateCode(8);
                        form.setValue("code", code, { shouldDirty: true });
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sinh ngẫu nhiên
                    </Button>
                  </div>
                  <FormDescription className="text-xs">
                    Chỉ chữ HOA, số, dấu gạch dưới/ngang. Tự động viết hoa khi nhập.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                      placeholder="VD: Giảm 10% cho đơn từ 500k - tháng 5/2026"
                      maxLength={500}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type + Value */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kiểu giảm giá <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENT">
                          PERCENT — giảm theo % subtotal
                        </SelectItem>
                        <SelectItem value="FIXED">
                          FIXED — giảm số tiền cố định
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá trị <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={type === "PERCENT" ? 100 : undefined}
                        step={type === "PERCENT" ? 1 : 1000}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        placeholder={type === "PERCENT" ? "10" : "50000"}
                        className="text-right tabular-nums"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {type === "PERCENT"
                        ? "Phần trăm 1-100 (vd: 10 = giảm 10%)"
                        : "VND số nguyên (vd: 50000 = giảm 50.000₫)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minOrderValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn tối thiểu (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Để trống = không giới hạn"
                      className="text-right tabular-nums"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Đơn hàng phải đạt số tiền này mới được áp dụng mã.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date range */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hiệu lực từ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hiệu lực đến <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới hạn sử dụng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      placeholder="Để trống = không giới hạn"
                      className="text-right tabular-nums"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Tổng số lần mã có thể được sử dụng.
                    {mode === "edit" && usedCount > 0 && (
                      <span className="ml-2 font-medium text-orange-700">
                        Đã dùng: {usedCount} lần
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Đang bật</FormLabel>
                    <FormDescription className="text-xs">
                      Tắt để tạm dừng mã (khách không áp được).
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Card>

          {/* Sticky save bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:left-64">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {form.formState.isDirty
                  ? "● Có thay đổi chưa lưu"
                  : mode === "edit"
                    ? "Chưa có thay đổi"
                    : "Sẵn sàng tạo coupon mới"}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" type="button">
                  <Link href="/admin/coupons">
                    <X className="h-4 w-4" /> Huỷ
                  </Link>
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "create" ? "Tạo coupon" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

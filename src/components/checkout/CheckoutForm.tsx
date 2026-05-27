"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/validations/checkout";
import { createOrder } from "@/lib/actions/order";
import { useCartStore } from "@/store/cart";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressFields } from "./AddressFields";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { ShippingMethodPicker } from "./ShippingMethodPicker";
import { CouponInput } from "./CouponInput";
import { CheckoutSummary } from "./CheckoutSummary";

const DEFAULTS: CheckoutInput = {
  recipientName: "",
  recipientPhone: "",
  recipientEmail: "",
  provinceCode: "",
  provinceName: "",
  districtCode: "",
  districtName: "",
  wardCode: "",
  wardName: "",
  street: "",
  note: "",
  paymentMethod: "COD",
  shippingMethod: "GHN",
  couponCode: undefined,
  items: [],
  termsAccepted: true as const,
};

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const items = useCartStore((s) => s.items);
  const { toast } = useToast();

  const [discountAmount, setDiscountAmount] = React.useState(0);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { ...DEFAULTS, termsAccepted: false as unknown as true },
    mode: "onBlur",
  });

  // Redirect khi giỏ trống (sau hydrate)
  React.useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  // Sync items vào form (server re-validate)
  React.useEffect(() => {
    if (!hydrated) return;
    form.setValue(
      "items",
      items.map((i) => ({
        productVariantId: i.productVariantId,
        productSlug: i.productSlug,
        productName: i.productName,
        variantName: i.variantName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    );
  }, [hydrated, items, form]);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  async function onSubmit(values: CheckoutInput) {
    const result = await createOrder(values);

    if (!result.ok) {
      // Field errors → set vào form
      if (result.fieldErrors) {
        (Object.entries(result.fieldErrors) as [keyof CheckoutInput, string[]][]).forEach(
          ([field, msgs]) => {
            if (msgs[0]) form.setError(field, { message: msgs[0] });
          },
        );
      }
      toast({
        title: "Không tạo được đơn hàng",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    // Thành công → clear cart + redirect
    useCartStore.getState().clear();
    router.push(result.redirectUrl);
  }

  if (!hydrated) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    // Đang redirect
    return null;
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-8 lg:grid-cols-[1fr_400px]"
        >
          {/* Left: form */}
          <div className="space-y-6">
            <Section title="Thông tin người nhận">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Họ và tên <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số điện thoại <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Địa chỉ giao hàng">
              <AddressFields />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú đơn hàng</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Section>

            <Section title="Phương thức vận chuyển">
              <ShippingMethodPicker />
            </Section>

            <Section title="Phương thức thanh toán">
              <PaymentMethodPicker />
            </Section>

            <Section title="Mã giảm giá">
              <CouponInput
                subtotal={subtotal}
                onApplied={(applied) =>
                  setDiscountAmount(applied?.discountAmount ?? 0)
                }
              />
            </Section>

            <div className="rounded-lg border bg-muted/30 p-4">
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <span className="text-sm">
                        Tôi đồng ý với{" "}
                        <Link href="/terms" className="text-brand-primary hover:underline" target="_blank">
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link
                          href="/privacy"
                          className="text-brand-primary hover:underline"
                          target="_blank"
                        >
                          Chính sách bảo mật
                        </Link>{" "}
                        của LAVIPCO.
                      </span>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg">
                <Link href="/cart">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại giỏ hàng
                </Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                variant="brand"
                className="flex-1 sm:flex-none sm:min-w-[200px]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                Đặt hàng
              </Button>
            </div>
          </div>

          {/* Right: summary */}
          <div>
            <CheckoutSummary discountAmount={discountAmount} />
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}

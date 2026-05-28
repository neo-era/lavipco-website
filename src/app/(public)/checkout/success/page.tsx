import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Truck, Building } from "lucide-react";

import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import { loadSettings } from "@/lib/actions/admin-settings";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { OrderCodeCopy } from "@/components/checkout/OrderCodeCopy";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  robots: { index: false, follow: false },
};

type SearchParams = {
  code?: string;
  pending?: string; // "vnpay" | "momo"
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code, pending } = await searchParams;
  if (!code) notFound();

  const order = await db.order.findUnique({
    where: { code },
    include: {
      items: { select: { productName: true, variantName: true, quantity: true, totalPrice: true } },
    },
  });

  if (!order) notFound();

  const shipping = order.shippingSnapshot as Record<string, string> | null;
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";

  // Thông tin chuyển khoản lấy từ Settings (admin config ở /admin/settings → Payment)
  const settings = isBankTransfer ? await loadSettings() : null;
  const bankInfo = settings?.payment_bankAccount?.trim() ?? "";

  return (
    <>
      <ClearCartOnMount />
      <section className="py-12 md:py-16">
        <Container className="max-w-3xl">
          {/* Success icon + heading */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-balance text-3xl font-bold md:text-4xl">
              Đặt hàng thành công!
            </h1>
            <p className="mt-3 text-muted-foreground">
              Cảm ơn bạn đã đặt hàng tại {SITE_CONFIG.name}. Đội ngũ sẽ xử lý đơn của
              bạn trong thời gian sớm nhất.
            </p>
          </div>

          {/* Order code */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-xl border bg-card p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Mã đơn hàng
              </p>
              <p className="font-mono text-xl font-bold text-brand-primary">{order.code}</p>
            </div>
            <OrderCodeCopy code={order.code} />
          </div>

          {/* Pending payment warning */}
          {pending === "vnpay" || pending === "momo" ? (
            <div className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
              <p className="text-sm font-semibold">
                Đơn hàng đang chờ thanh toán {pending === "vnpay" ? "VNPay" : "MoMo"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tính năng thanh toán online sẽ sớm sẵn sàng (Phase 4.3). Hiện tại
                đơn hàng đã được tạo, đội ngũ LAVIPCO sẽ liên hệ để hỗ trợ thanh toán.
              </p>
            </div>
          ) : null}

          {/* Bank transfer guide */}
          {isBankTransfer && (
            <BankTransferGuide order={order} bankInfo={bankInfo} />
          )}

          {/* Order summary */}
          <div className="mt-6 space-y-5 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-bold">Tóm tắt đơn hàng</h2>

            {/* Items */}
            <ul className="space-y-2 border-y py-4 text-sm">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    <p className="font-medium">{formatCurrency(Number(item.totalPrice))}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pricing */}
            <dl className="space-y-2 text-sm">
              <Row label="Tạm tính" value={formatCurrency(Number(order.subtotal))} />
              {Number(order.discountAmount) > 0 && (
                <Row
                  label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ""}`}
                  value={`-${formatCurrency(Number(order.discountAmount))}`}
                  valueClass="text-green-600"
                />
              )}
              <Row label="Phí vận chuyển" value={formatCurrency(Number(order.shippingFee))} />
              <div className="flex items-baseline justify-between border-t pt-3">
                <dt className="font-semibold">Tổng cộng</dt>
                <dd className="text-xl font-bold text-brand-primary">
                  {formatCurrency(Number(order.total))}
                </dd>
              </div>
            </dl>

            {/* Shipping address */}
            {shipping && (
              <div className="border-t pt-4 text-sm">
                <p className="mb-2 flex items-center gap-2 font-semibold">
                  <Truck className="h-4 w-4 text-brand-primary" />
                  Địa chỉ giao hàng
                </p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    <span className="text-foreground">{shipping.recipientName}</span>
                    {" - "}
                    {shipping.recipientPhone}
                  </p>
                  <p>{shipping.recipientEmail}</p>
                  <p>
                    {shipping.street}, {shipping.wardName},{" "}
                    {shipping.provinceName}
                  </p>
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-3 border-t pt-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-full">
                {paymentMethodLabel(order.paymentMethod)}
              </Badge>
              <span>Đặt lúc: {formatDateTime(order.createdAt)}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href="/account/orders">
                Xem đơn hàng của tôi <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                <Package className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "COD":
      return "Thanh toán khi nhận hàng";
    case "BANK_TRANSFER":
      return "Chuyển khoản ngân hàng";
    case "VNPAY":
      return "VNPay";
    case "MOMO":
      return "Ví MoMo";
    case "ZALOPAY":
      return "ZaloPay";
    default:
      return method;
  }
}

function BankTransferGuide({
  order,
  bankInfo,
}: {
  order: { code: string; total: import("@prisma/client").Prisma.Decimal };
  bankInfo: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Building className="h-5 w-5 text-brand-primary" />
        <h3 className="font-semibold">Hướng dẫn chuyển khoản</h3>
      </div>

      {bankInfo ? (
        // Thông tin ngân hàng từ Settings (textarea tự do — render giữ xuống dòng)
        <div className="whitespace-pre-line rounded-md bg-background/60 p-3 text-sm">
          {bankInfo}
        </div>
      ) : (
        <p className="rounded-md bg-orange-500/10 p-3 text-sm text-orange-700">
          Thông tin chuyển khoản chưa được cấu hình. Vui lòng liên hệ{" "}
          {SITE_CONFIG.hotline || "hotline LAVIPCO"} để được hướng dẫn thanh toán.
        </p>
      )}

      {/* Số tiền + nội dung CK luôn động theo đơn (để đối soát) */}
      <dl className="mt-3 space-y-2 text-sm">
        <div className="grid grid-cols-[120px_1fr] gap-2">
          <dt className="text-muted-foreground">Số tiền</dt>
          <dd className="font-bold text-brand-primary">
            {formatCurrency(Number(order.total))}
          </dd>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-2">
          <dt className="text-muted-foreground">Nội dung CK</dt>
          <dd className="font-mono font-medium">{order.code}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Vui lòng ghi đúng nội dung chuyển khoản để đối soát nhanh.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-foreground/80">{label}</dt>
      <dd className={valueClass ?? "font-medium"}>{value}</dd>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS, PAYMENT_METHOD, SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { OrderActions } from "@/components/account/OrderActions";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const { code } = await params;
    redirect(`/sign-in?callbackUrl=/account/orders/${code}`);
  }

  const { code } = await params;
  const order = await db.order.findUnique({
    where: { code },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          variantName: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          variant: { select: { product: { select: { slug: true } } } },
        },
      },
    },
  });

  if (!order) notFound();

  // Verify ownership: order user-linked match, hoặc guest order match email
  const ownsOrder =
    order.userId === session.user.id ||
    (order.guestEmail && order.guestEmail === session.user.email);
  if (!ownsOrder) notFound();

  const shipping = order.shippingSnapshot as Record<string, string> | null;
  const orderMeta = ORDER_STATUS[order.orderStatus];
  const paymentMeta = PAYMENT_STATUS[order.paymentStatus];
  const shipMeta = SHIPPING_STATUS[order.shippingStatus];
  const paymentMethod = PAYMENT_METHOD[order.paymentMethod];

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/orders">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <OrderActions orderCode={order.code} />
      </div>

      {/* Title block - hiển thị cả khi print */}
      <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0">
        <div className="hidden text-center print:block print:mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {SITE_CONFIG.fullName}
          </p>
          <h1 className="mt-1 text-2xl font-bold">HOÁ ĐƠN</h1>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Mã đơn hàng
            </p>
            <p className="font-mono text-2xl font-bold text-brand-primary">
              {order.code}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Đặt lúc: {formatDateTime(order.createdAt)}</p>
            {order.updatedAt.getTime() !== order.createdAt.getTime() && (
              <p>Cập nhật: {formatDateTime(order.updatedAt)}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={orderMeta.variant} className="rounded-full">
            {orderMeta.label}
          </Badge>
          <Badge variant={paymentMeta.variant} className="rounded-full">
            Thanh toán: {paymentMeta.label}
          </Badge>
          <Badge variant={shipMeta.variant} className="rounded-full">
            Giao hàng: {shipMeta.label}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-6 text-lg font-bold">Trạng thái đơn hàng</h2>
        <OrderStatusTimeline
          orderStatus={order.orderStatus}
          shippingStatus={order.shippingStatus}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="text-lg font-bold">Sản phẩm</h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {item.productName}
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      SKU: <span className="font-mono">{item.sku}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                    </p>
                    <p className="font-semibold text-brand-primary">
                      {formatCurrency(Number(item.totalPrice))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Tổng tiền</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Tạm tính" value={formatCurrency(Number(order.subtotal))} />
              {Number(order.discountAmount) > 0 && (
                <Row
                  label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ""}`}
                  value={`-${formatCurrency(Number(order.discountAmount))}`}
                  valueClass="text-green-600"
                />
              )}
              <Row
                label="Phí vận chuyển"
                value={formatCurrency(Number(order.shippingFee))}
              />
              <div className="flex items-baseline justify-between border-t pt-3">
                <dt className="font-semibold">Tổng cộng</dt>
                <dd className="text-2xl font-bold text-brand-primary">
                  {formatCurrency(Number(order.total))}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Sidebar info */}
        <section className="space-y-4">
          {/* Shipping */}
          {shipping && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-primary" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-0.5 text-sm">
                <p className="font-semibold">{shipping.recipientName}</p>
                <p className="text-muted-foreground">{shipping.recipientPhone}</p>
                <p className="text-muted-foreground">{shipping.recipientEmail}</p>
                <p className="pt-2">
                  {shipping.street}, {shipping.wardName},{" "}
                  {shipping.provinceName}
                </p>
                {order.note && (
                  <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Ghi chú: {order.note}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-4 w-4 text-brand-primary" />
              Thanh toán
            </h3>
            <p className="text-sm font-medium">{paymentMethod.label}</p>
            <Badge variant={paymentMeta.variant} className="mt-2 rounded-full text-[10px]">
              {paymentMeta.label}
            </Badge>
          </div>
        </section>
      </div>

      {/* Print footer */}
      <div className="hidden text-center text-xs text-muted-foreground print:block">
        <p>Cảm ơn quý khách đã mua hàng tại {SITE_CONFIG.name}.</p>
        <p>Mọi thắc mắc liên hệ: {SITE_CONFIG.hotline || "1900 0000"}</p>
      </div>
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

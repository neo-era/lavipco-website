import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Truck,
  Tag,
  Package,
} from "lucide-react";

import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
  PAYMENT_METHOD,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { OrderActionsCard } from "@/components/admin/order-detail/OrderActionsCard";
import { InternalNoteEditor } from "@/components/admin/order-detail/InternalNoteEditor";
import { OrderActivityFeed } from "@/components/admin/order-detail/OrderActivityFeed";
import { OrderPrintButton } from "@/components/admin/order-detail/OrderPrintButton";

export const metadata: Metadata = { title: "Chi tiết đơn" };

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await db.order.findUnique({
    where: { code },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      items: {
        select: {
          id: true,
          productName: true,
          variantName: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          variant: {
            select: {
              product: { select: { slug: true, images: true } },
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!order) notFound();

  // OrderActivity.byUserId không có relation trong schema → lookup user thủ công
  const byUserIds = Array.from(
    new Set(
      order.activities
        .map((a) => a.byUserId)
        .filter((v): v is string => Boolean(v)),
    ),
  );
  const byUsers = byUserIds.length
    ? await db.user.findMany({
        where: { id: { in: byUserIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const byUserMap = new Map(byUsers.map((u) => [u.id, u]));

  const activitiesForUI = order.activities.map((a) => ({
    id: a.id,
    action: a.action,
    fromValue: a.fromValue,
    toValue: a.toValue,
    note: a.note,
    createdAt: a.createdAt,
    byUser: a.byUserId ? byUserMap.get(a.byUserId) ?? null : null,
  }));

  const shipping = order.shippingSnapshot as Record<string, string> | null;
  const orderMeta = ORDER_STATUS[order.orderStatus];
  const paymentMeta = PAYMENT_STATUS[order.paymentStatus];
  const shipMeta = SHIPPING_STATUS[order.shippingStatus];
  const methodLabel = PAYMENT_METHOD[order.paymentMethod].label;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <OrderPrintButton />
      </div>

      {/* Title block */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Mã đơn hàng
            </p>
            <p className="font-mono text-2xl font-bold text-brand-primary md:text-3xl">
              {order.code}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Đặt lúc: {formatDateTime(order.createdAt)}</p>
            {order.updatedAt.getTime() !== order.createdAt.getTime() && (
              <p>Cập nhật: {formatDateTime(order.updatedAt)}</p>
            )}
            {order.cancelledAt && (
              <p className="text-destructive">
                Huỷ lúc: {formatDateTime(order.cancelledAt)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
      <section className="rounded-xl border bg-card p-5 print:hidden">
        <h2 className="mb-5 text-base font-bold">Tiến trình đơn hàng</h2>
        <OrderStatusTimeline
          orderStatus={order.orderStatus}
          shippingStatus={order.shippingStatus}
        />
      </section>

      {/* Main 3-col grid: 2/3 main + 1/3 sidebar */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: items + pricing + internal note */}
        <div className="space-y-5 lg:col-span-2">
          {/* Items */}
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Package className="h-4 w-4 text-brand-primary" />
                Sản phẩm ({order.items.length})
              </h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item) => {
                const cover = item.variant.product.images[0];
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start gap-3 p-4"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={item.productName}
                        className="h-14 w-14 shrink-0 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.variant.product.slug}`}
                        target="_blank"
                        className="font-medium hover:text-brand-primary"
                      >
                        {item.productName}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">
                          {item.variantName}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
                );
              })}
            </ul>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Tổng tiền</h2>
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
              {order.refundAmount && (
                <Row
                  label="Đã hoàn tiền"
                  value={`-${formatCurrency(Number(order.refundAmount))}`}
                  valueClass="text-orange-600"
                />
              )}
              <div className="flex items-baseline justify-between border-t pt-3">
                <dt className="font-semibold">Tổng cộng</dt>
                <dd className="text-2xl font-bold text-brand-primary">
                  {formatCurrency(Number(order.total))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Internal Note */}
          <InternalNoteEditor
            orderId={order.id}
            initial={order.internalNote ?? ""}
          />

          {/* Activity feed */}
          <OrderActivityFeed activities={activitiesForUI} />
        </div>

        {/* Right sidebar: customer + shipping address + payment + shipping + actions */}
        <div className="space-y-4 print:hidden">
          {/* Customer */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-4 w-4 text-brand-primary" />
              Khách hàng
            </h3>
            {order.user ? (
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{order.user.name || "Chưa có tên"}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
                {order.user.phone && (
                  <p className="text-muted-foreground">{order.user.phone}</p>
                )}
                <p className="pt-1 text-[11px] text-muted-foreground">
                  Đăng ký: {formatDateTime(order.user.createdAt)}
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Khách vãng lai</p>
                {order.guestEmail && (
                  <p className="text-muted-foreground">{order.guestEmail}</p>
                )}
                {order.guestPhone && (
                  <p className="text-muted-foreground">{order.guestPhone}</p>
                )}
              </div>
            )}
          </div>

          {/* Shipping address */}
          {shipping && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-primary" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-0.5 text-sm">
                <p className="font-semibold">{shipping.recipientName}</p>
                <p className="text-muted-foreground">{shipping.recipientPhone}</p>
                {shipping.recipientEmail && (
                  <p className="text-muted-foreground">{shipping.recipientEmail}</p>
                )}
                <p className="pt-2">
                  {shipping.street}, {shipping.wardName},{" "}
                  {shipping.provinceName}
                </p>
                {order.note && (
                  <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <strong>Ghi chú khách:</strong> {order.note}
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
            <p className="text-sm font-medium">{methodLabel}</p>
            <Badge
              variant={paymentMeta.variant}
              className="mt-2 rounded-full text-[10px]"
            >
              {paymentMeta.label}
            </Badge>
            {order.paymentTransactionId && (
              <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                TxnNo: {order.paymentTransactionId}
              </p>
            )}
            {order.refundedAt && (
              <p className="mt-1 text-[11px] text-orange-700">
                Hoàn tiền: {formatDateTime(order.refundedAt)}
                {order.refundAmount &&
                  ` · ${formatCurrency(Number(order.refundAmount))}`}
              </p>
            )}
          </div>

          {/* Shipping */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Truck className="h-4 w-4 text-brand-primary" />
              Vận chuyển
            </h3>
            {order.shippingProvider || order.trackingCode ? (
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Đơn vị:</strong> {order.shippingProvider || "—"}
                </p>
                {order.trackingCode && (
                  <p className="break-all">
                    <strong>Mã vận đơn:</strong>{" "}
                    <span className="font-mono text-brand-primary">
                      {order.trackingCode}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có thông tin vận chuyển.</p>
            )}
            <Badge variant={shipMeta.variant} className="mt-2 rounded-full text-[10px]">
              {shipMeta.label}
            </Badge>
          </div>

          {/* Coupon (nếu có) */}
          {order.couponCode && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="h-4 w-4 text-brand-primary" />
                Mã giảm giá
              </h3>
              <p className="font-mono text-sm text-brand-primary">{order.couponCode}</p>
              <p className="text-[11px] text-muted-foreground">
                Giảm {formatCurrency(Number(order.discountAmount))}
              </p>
            </div>
          )}

          {/* Cancel reason (nếu có) */}
          {order.cancelReason && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-destructive">
                Lý do huỷ
              </h3>
              <p className="text-sm text-foreground/80">{order.cancelReason}</p>
            </div>
          )}

          {/* Actions card */}
          <OrderActionsCard
            orderId={order.id}
            orderCode={order.code}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
            shippingStatus={order.shippingStatus}
            paymentMethod={order.paymentMethod}
            total={Number(order.total)}
            paymentTransactionId={order.paymentTransactionId}
            shippingProvider={order.shippingProvider}
            trackingCode={order.trackingCode}
          />
        </div>
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

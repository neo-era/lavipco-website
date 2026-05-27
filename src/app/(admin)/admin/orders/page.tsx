import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
  PAYMENT_METHOD,
  ADMIN_TABLE_PAGE_SIZE,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/Pagination";
import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";
import { AdminOrderStatsCards } from "@/components/admin/AdminOrderStatsCards";

export const metadata: Metadata = { title: "Đơn hàng" };

export const dynamic = "force-dynamic";

const VALID_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const;
const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
const VALID_SHIPPING_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
] as const;
const VALID_PAYMENT_METHODS = [
  "COD",
  "VNPAY",
  "MOMO",
  "ZALOPAY",
  "BANK_TRANSFER",
] as const;

type SearchParams = {
  q?: string;
  orderStatus?: string;
  paymentStatus?: string;
  shippingStatus?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = sp.q?.trim() ?? "";
  const orderStatus =
    sp.orderStatus &&
    (VALID_ORDER_STATUSES as readonly string[]).includes(sp.orderStatus)
      ? sp.orderStatus
      : "ALL";
  const paymentStatus =
    sp.paymentStatus &&
    (VALID_PAYMENT_STATUSES as readonly string[]).includes(sp.paymentStatus)
      ? sp.paymentStatus
      : "ALL";
  const shippingStatus =
    sp.shippingStatus &&
    (VALID_SHIPPING_STATUSES as readonly string[]).includes(sp.shippingStatus)
      ? sp.shippingStatus
      : "ALL";
  const paymentMethod =
    sp.paymentMethod &&
    (VALID_PAYMENT_METHODS as readonly string[]).includes(sp.paymentMethod)
      ? sp.paymentMethod
      : "ALL";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  // Build Prisma where
  const where: Prisma.OrderWhereInput = {};
  if (orderStatus !== "ALL")
    where.orderStatus = orderStatus as (typeof VALID_ORDER_STATUSES)[number];
  if (paymentStatus !== "ALL")
    where.paymentStatus = paymentStatus as (typeof VALID_PAYMENT_STATUSES)[number];
  if (shippingStatus !== "ALL")
    where.shippingStatus =
      shippingStatus as (typeof VALID_SHIPPING_STATUSES)[number];
  if (paymentMethod !== "ALL")
    where.paymentMethod = paymentMethod as (typeof VALID_PAYMENT_METHODS)[number];

  if (from || to) {
    where.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) where.createdAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) {
        const end = new Date(d);
        end.setDate(end.getDate() + 1);
        where.createdAt.lt = end;
      }
    }
  }

  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
      { guestPhone: { contains: q } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { phone: { contains: q } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { trackingCode: { contains: q, mode: "insensitive" } },
    ];
  }

  const [orders, total, statsAggregate, pendingCount, deliveredCount] =
    await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: ADMIN_TABLE_PAGE_SIZE,
        select: {
          id: true,
          code: true,
          createdAt: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          shippingStatus: true,
          paymentMethod: true,
          guestEmail: true,
          guestPhone: true,
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),
      db.order.count({ where }),
      db.order.aggregate({
        where: { ...where, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      db.order.count({ where: { orderStatus: "PENDING" } }),
      db.order.count({ where: { ...where, shippingStatus: "DELIVERED" } }),
    ]);

  const totalRevenue = Number(statsAggregate._sum.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (orderStatus !== "ALL") params.set("orderStatus", orderStatus);
    if (paymentStatus !== "ALL") params.set("paymentStatus", paymentStatus);
    if (shippingStatus !== "ALL") params.set("shippingStatus", shippingStatus);
    if (paymentMethod !== "ALL") params.set("paymentMethod", paymentMethod);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Đơn hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý đơn hàng: cập nhật trạng thái, thanh toán, vận chuyển, huỷ và hoàn tiền.
        </p>
      </div>

      <AdminOrderStatsCards
        totalOrders={total}
        totalRevenue={totalRevenue}
        pendingCount={pendingCount}
        deliveredCount={deliveredCount}
        hint={from || to ? "trong khoảng đã lọc" : "toàn bộ"}
      />

      <AdminOrderFilters
        initial={{
          q,
          orderStatus,
          paymentStatus,
          shippingStatus,
          paymentMethod,
          from,
          to,
        }}
      />

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Không tìm thấy đơn nào phù hợp."
          : `Hiển thị ${skip + 1}–${skip + orders.length} trên tổng ${total} đơn`}
      </p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <ShoppingBag className="h-8 w-8" />
          Chưa có đơn nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="hidden md:table-cell">Thanh toán</TableHead>
                <TableHead className="hidden lg:table-cell">Vận chuyển</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden xl:table-cell">Ngày đặt</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const orderMeta = ORDER_STATUS[order.orderStatus];
                const paymentMeta = PAYMENT_STATUS[order.paymentStatus];
                const shipMeta = SHIPPING_STATUS[order.shippingStatus];
                const methodLabel = PAYMENT_METHOD[order.paymentMethod].label;
                const customerLabel =
                  order.user?.name ||
                  order.user?.email ||
                  order.guestEmail ||
                  "Khách vãng lai";
                const phone = order.user?.phone || order.guestPhone || "—";

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.code}`}
                        className="font-mono text-sm font-bold text-brand-primary hover:underline"
                      >
                        {order.code}
                      </Link>
                      <div className="text-[10px] text-muted-foreground">
                        {order._count.items} sp
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="truncate">{customerLabel}</p>
                      {order.user?.email && order.user.email !== customerLabel && (
                        <p className="truncate text-xs text-muted-foreground">
                          {order.user.email}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs lg:table-cell">
                      {phone}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-0.5">
                        <Badge
                          variant={paymentMeta.variant}
                          className="rounded-full text-[10px]"
                        >
                          {paymentMeta.label}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {methodLabel}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={shipMeta.variant}
                        className="rounded-full text-[10px]"
                      >
                        {shipMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={orderMeta.variant}
                        className="rounded-full text-[10px]"
                      >
                        {orderMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.code}`}>
                          Xem
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildPageUrl={buildPageUrl}
          />
        </div>
      )}
    </div>
  );
}

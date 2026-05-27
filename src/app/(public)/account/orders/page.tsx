import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Prisma, type OrderStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
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
import { OrdersFilter } from "@/components/account/OrdersFilter";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;
const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

type SearchParams = {
  status?: string;
  q?: string;
  page?: string;
};

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/orders");

  const sp = await searchParams;
  const status = VALID_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : null;
  const query = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const email = session.user.email ?? "";
  // Match cả order user-linked và guest order với cùng email
  const where: Prisma.OrderWhereInput = {
    AND: [
      {
        OR: [
          { userId: session.user.id },
          ...(email ? [{ userId: null, guestEmail: email }] : []),
        ],
      },
      ...(status ? [{ orderStatus: status }] : []),
      ...(query
        ? [{ code: { contains: query, mode: Prisma.QueryMode.insensitive } }]
        : []),
    ],
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        code: true,
        createdAt: true,
        total: true,
        orderStatus: true,
        paymentStatus: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/account/orders?${qs}` : "/account/orders";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Đơn hàng của tôi</h1>
        <p className="mt-1 text-muted-foreground">
          {total === 0
            ? "Chưa có đơn hàng nào."
            : `Tổng ${total} đơn hàng${status ? ` ở trạng thái "${ORDER_STATUS[status].label}"` : ""}.`}
        </p>
      </div>

      <OrdersFilter />

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-card py-16 text-center">
          <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {total === 0
              ? "Bạn chưa đặt đơn hàng nào tại LAVIPCO."
              : "Không có đơn nào khớp filter hiện tại."}
          </p>
          <Button asChild variant="brand" size="sm" className="mt-4">
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead className="hidden sm:table-cell">Ngày đặt</TableHead>
                <TableHead className="hidden md:table-cell">SP</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden lg:table-cell">Thanh toán</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusMeta = ORDER_STATUS[order.orderStatus];
                const paymentMeta = PAYMENT_STATUS[order.paymentStatus];
                return (
                  <TableRow key={order.code}>
                    <TableCell>
                      <Link
                        href={`/account/orders/${order.code}`}
                        className="font-mono text-sm font-bold text-brand-primary hover:underline"
                      >
                        {order.code}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {order._count.items} sản phẩm
                    </TableCell>
                    <TableCell className="font-semibold text-brand-primary">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMeta.variant} className="rounded-full text-[10px]">
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={paymentMeta.variant} className="rounded-full text-[10px]">
                        {paymentMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/account/orders/${order.code}`}>
                          Chi tiết
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
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          buildPageUrl={buildPageUrl}
        />
      )}
    </div>
  );
}

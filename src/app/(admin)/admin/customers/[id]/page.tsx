import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  ShoppingBag,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";
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
import { AdminCustomerActions } from "@/components/admin/AdminCustomerActions";

export const metadata: Metadata = { title: "Chi tiết khách hàng" };

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") notFound();

  const { id } = await params;
  const customer = await db.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          code: true,
          createdAt: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          _count: { select: { items: true } },
        },
      },
      _count: { select: { orders: true, wishlistItems: true, addresses: true } },
    },
  });

  if (!customer) notFound();

  // Tổng chi tiêu (PAID)
  const paidAgg = await db.order.aggregate({
    where: { userId: id, paymentStatus: "PAID" },
    _sum: { total: true },
    _count: { _all: true },
  });
  const totalSpent = Number(paidAgg._sum.total ?? 0);
  const paidOrders = paidAgg._count._all;

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/customers">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">
            {customer.name || customer.email}
          </h1>
          <Badge
            variant={
              customer.role === "ADMIN"
                ? "brand"
                : customer.role === "STAFF"
                  ? "accent"
                  : "secondary"
            }
            className="rounded-full"
          >
            {customer.role}
          </Badge>
          {customer.isLocked && (
            <Badge variant="destructive" className="rounded-full">
              <Lock className="mr-1 h-3 w-3" />
              Khoá
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left 2/3: info + orders */}
        <div className="space-y-5 lg:col-span-2">
          {/* Info */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-base font-bold">Thông tin liên hệ</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Mail className="h-3 w-3" /> Email
                </dt>
                <dd className="mt-0.5">
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-brand-primary hover:underline"
                  >
                    {customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Phone className="h-3 w-3" /> SĐT
                </dt>
                <dd className="mt-0.5">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-brand-primary hover:underline"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Chưa có</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Đăng ký
                </dt>
                <dd className="mt-0.5">{formatDateTime(customer.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email verified
                </dt>
                <dd className="mt-0.5">
                  {customer.emailVerified ? (
                    <Badge variant="default" className="rounded-full text-[10px]">
                      Đã xác minh
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      Chưa xác minh
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Tổng đơn"
              value={String(customer._count.orders)}
            />
            <StatTile
              label="Đơn đã thanh toán"
              value={String(paidOrders)}
              accent
            />
            <StatTile
              label="Tổng chi tiêu"
              value={formatCurrency(totalSpent)}
              accent
            />
          </div>

          {/* Order history */}
          <div className="rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <ShoppingBag className="h-4 w-4 text-brand-primary" />
                Lịch sử đơn hàng ({customer._count.orders})
              </h2>
              {customer._count.orders > 20 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Hiển thị 20 đơn gần nhất. Lọc theo khách trong{" "}
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                    className="text-brand-primary hover:underline"
                  >
                    danh sách đơn
                  </Link>{" "}
                  để xem đầy đủ.
                </p>
              )}
            </div>
            {customer.orders.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Khách chưa có đơn nào.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead className="hidden sm:table-cell">Ngày</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Thanh toán
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((o) => {
                    const orderMeta = ORDER_STATUS[o.orderStatus];
                    const paymentMeta = PAYMENT_STATUS[o.paymentStatus];
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link
                            href={`/admin/orders/${o.code}`}
                            className="font-mono text-sm font-bold text-brand-primary hover:underline"
                          >
                            {o.code}
                          </Link>
                          <p className="text-[10px] text-muted-foreground">
                            {o._count.items} sp
                          </p>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                          {formatDate(o.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(Number(o.total))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={orderMeta.variant}
                            className="rounded-full text-[10px]"
                          >
                            {orderMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={paymentMeta.variant}
                            className="rounded-full text-[10px]"
                          >
                            {paymentMeta.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                <MapPin className="h-4 w-4 text-brand-primary" />
                Sổ địa chỉ ({customer.addresses.length})
              </h2>
              <ul className="space-y-3">
                {customer.addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="rounded-md border bg-muted/20 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{addr.fullName}</strong>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-xs">{addr.phone}</span>
                      {addr.isDefault && (
                        <Badge
                          variant="default"
                          className="rounded-full text-[10px]"
                        >
                          Mặc định
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm">
                      {addr.street}, {addr.ward}, {addr.province}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right 1/3: actions (tag/lock/note) */}
        <div>
          <AdminCustomerActions
            customerId={customer.id}
            customerName={customer.name || customer.email}
            initialTags={customer.tags}
            initialNote={customer.adminNote ?? ""}
            isLocked={customer.isLocked}
            isSelf={customer.id === session.user.id}
            isAdminRole={customer.role === "ADMIN"}
            currentRole={customer.role}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          accent
            ? "mt-1 text-xl font-bold text-brand-primary"
            : "mt-1 text-xl font-bold"
        }
      >
        {value}
      </p>
    </div>
  );
}

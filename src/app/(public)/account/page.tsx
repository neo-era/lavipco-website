import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  Wallet,
  Gift,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account");

  const userId = session.user.id;
  const email = session.user.email ?? "";

  // Match cả order user-linked và guest order với cùng email
  const ownershipFilter = {
    OR: [{ userId }, ...(email ? [{ userId: null, guestEmail: email }] : [])],
  };

  const [totalOrders, processingOrders, totalSpent, recentOrders] = await Promise.all([
    db.order.count({ where: ownershipFilter }),
    db.order.count({
      where: {
        ...ownershipFilter,
        orderStatus: { in: ["PENDING", "CONFIRMED", "PROCESSING"] },
      },
    }),
    db.order.aggregate({
      where: { ...ownershipFilter, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    db.order.findMany({
      where: ownershipFilter,
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        code: true,
        createdAt: true,
        total: true,
        orderStatus: true,
        paymentStatus: true,
      },
    }),
  ]);

  const displayName =
    session.user.name || email.split("@")[0] || "Bạn";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Xin chào, {displayName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tổng quan hoạt động và đơn hàng của bạn tại LAVIPCO.
        </p>
      </div>

      {/* 4 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          Icon={ShoppingBag}
          label="Tổng đơn hàng"
          value={String(totalOrders)}
        />
        <StatCard
          Icon={Clock}
          label="Đang xử lý"
          value={String(processingOrders)}
        />
        <StatCard
          Icon={Wallet}
          label="Tổng chi tiêu"
          value={formatCurrency(Number(totalSpent._sum.total ?? 0))}
        />
        <StatCard
          Icon={Gift}
          label="Điểm tích lũy"
          value="0"
          subtext="Sắp ra mắt"
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold">Đơn hàng gần nhất</h2>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href="/account/orders">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Bạn chưa có đơn hàng nào. Khám phá{" "}
              <Link href="/products" className="text-brand-primary hover:underline">
                sản phẩm LAVIPCO
              </Link>{" "}
              để đặt mua.
            </p>
          </Card>
        ) : (
          <Container className="space-y-3 p-0">
            {recentOrders.map((order) => {
              const meta = ORDER_STATUS[order.orderStatus];
              return (
                <Link
                  key={order.code}
                  href={`/account/orders/${order.code}`}
                  className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-brand-primary">
                          {order.code}
                        </span>
                        <Badge variant={meta.variant} className="rounded-full text-[10px]">
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Đặt ngày {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Tổng</p>
                      <p className="font-bold text-brand-primary">
                        {formatCurrency(Number(order.total))}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </Container>
        )}
      </div>
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  subtext,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-bold">{value}</p>
          {subtext && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

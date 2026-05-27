import type { Metadata } from "next";
import { Prisma, type OrderStatus } from "@prisma/client";
import { Wallet, ShoppingBag, UserPlus, Package } from "lucide-react";

import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import {
  RevenueChart,
  type RevenuePoint,
} from "@/components/admin/RevenueChart";
import {
  OrderStatusChart,
  type OrderStatusPoint,
} from "@/components/admin/OrderStatusChart";
import {
  TopProductsTable,
  type TopProductRow,
} from "@/components/admin/TopProductsTable";
import {
  TopCustomersTable,
  type TopCustomerRow,
} from "@/components/admin/TopCustomersTable";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { UnreadMessagesPanel } from "@/components/admin/UnreadMessagesPanel";

export const metadata: Metadata = { title: "Tổng quan" };

// Revalidate 60s — admin dashboard không cần realtime tuyệt đối
export const revalidate = 60;

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminDashboardPage() {
  // ====================================================================
  // 1. Tính khoảng thời gian
  // ====================================================================
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // 12 tháng gần nhất (bao gồm tháng hiện tại)
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // ====================================================================
  // 2. Fetch tất cả song song qua Promise.all
  // ====================================================================
  const [
    thisMonthRevenue,
    prevMonthRevenue,
    thisMonthOrders,
    newCustomers,
    activeProducts,
    revenueByMonthRaw,
    ordersByStatus,
    topProductsRaw,
    topCustomersRaw,
    recentOrders,
    unreadMessages,
  ] = await Promise.all([
    // Doanh thu tháng này (orders PAID)
    db.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
      _sum: { total: true },
    }),
    // Doanh thu tháng trước (để compare)
    db.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfPrevMonth, lt: startOfThisMonth },
      },
      _sum: { total: true },
    }),
    // Số đơn tháng này (mọi status)
    db.order.count({
      where: { createdAt: { gte: startOfThisMonth, lt: startOfNextMonth } },
    }),
    // Khách hàng mới (user đăng ký tháng này, role USER)
    db.user.count({
      where: {
        role: "USER",
        createdAt: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
    }),
    // Sản phẩm đang bán
    db.product.count({ where: { status: "ACTIVE" } }),

    // Doanh thu 12 tháng - raw SQL group by date_trunc('month')
    db.$queryRaw<Array<{ month: Date; revenue: number }>>(
      Prisma.sql`
        SELECT date_trunc('month', "createdAt") AS month,
               COALESCE(SUM(total), 0)::float8 AS revenue
        FROM orders
        WHERE "paymentStatus" = 'PAID'
          AND "createdAt" >= ${twelveMonthsAgo}
        GROUP BY month
        ORDER BY month ASC
      `,
    ),

    // Số đơn theo trạng thái
    db.order.groupBy({
      by: ["orderStatus"],
      _count: { _all: true },
    }),

    // Top 5 SP bán chạy tháng (PAID only)
    db.orderItem.groupBy({
      by: ["productVariantId", "productName", "variantName"],
      where: {
        order: {
          paymentStatus: "PAID",
          createdAt: { gte: startOfThisMonth, lt: startOfNextMonth },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),

    // Top 5 khách hàng (PAID only, all-time)
    db.order.groupBy({
      by: ["userId"],
      where: {
        paymentStatus: "PAID",
        userId: { not: null },
      },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),

    // 10 đơn mới nhất
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        code: true,
        createdAt: true,
        total: true,
        orderStatus: true,
        paymentStatus: true,
        userId: true,
        guestEmail: true,
        user: { select: { name: true, email: true } },
      },
    }),

    // 5 message NEW chưa đọc
    db.contactMessage.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
      },
    }),
  ]);

  // ====================================================================
  // 3. Transform data
  // ====================================================================
  const revenue = Number(thisMonthRevenue._sum.total ?? 0);
  const prevRevenue = Number(prevMonthRevenue._sum.total ?? 0);
  const revenueChangePercent =
    prevRevenue > 0
      ? ((revenue - prevRevenue) / prevRevenue) * 100
      : revenue > 0
        ? 100
        : 0;

  // Build 12-month revenue series, fill 0 cho tháng thiếu
  const revenueData: RevenuePoint[] = [];
  for (let i = 0; i < 12; i++) {
    const m = new Date(twelveMonthsAgo.getFullYear(), twelveMonthsAgo.getMonth() + i, 1);
    const matched = revenueByMonthRaw.find(
      (r) => new Date(r.month).getMonth() === m.getMonth() && new Date(r.month).getFullYear() === m.getFullYear(),
    );
    revenueData.push({
      label: `${String(m.getMonth() + 1).padStart(2, "0")}/${m.getFullYear()}`,
      revenue: Number(matched?.revenue ?? 0),
    });
  }

  // Order status: map count cho 5 status
  const statusData: OrderStatusPoint[] = ALL_ORDER_STATUSES.map((status) => {
    const found = ordersByStatus.find((o) => o.orderStatus === status);
    return { status, count: found?._count._all ?? 0 };
  });

  // Top products - lookup slug cho từng product variant
  const variantIds = topProductsRaw.map((r) => r.productVariantId);
  const variantsForSlug = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, product: { select: { slug: true } } },
  });
  const topProducts: TopProductRow[] = topProductsRaw.map((r) => ({
    productSlug:
      variantsForSlug.find((v) => v.id === r.productVariantId)?.product.slug ?? "",
    productName: r.productName,
    variantName: r.variantName,
    quantitySold: r._sum.quantity ?? 0,
    revenue: Number(r._sum.totalPrice ?? 0),
  }));

  // Top customers - lookup user info
  const customerIds = topCustomersRaw
    .map((r) => r.userId)
    .filter((id): id is string => id !== null);
  const customerUsers = await db.user.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true, email: true },
  });
  const topCustomers: TopCustomerRow[] = topCustomersRaw
    .filter((r) => r.userId !== null)
    .map((r) => {
      const user = customerUsers.find((u) => u.id === r.userId);
      return {
        identifier: user?.name || user?.email?.split("@")[0] || "Ẩn danh",
        email: user?.email ?? null,
        totalSpent: Number(r._sum.total ?? 0),
        orderCount: r._count._all,
      };
    });

  // Recent orders - flatten customer info
  const recentOrdersForUI = recentOrders.map((o) => ({
    code: o.code,
    createdAt: o.createdAt,
    total: o.total,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    customerLabel:
      o.user?.name || o.user?.email || o.guestEmail || "Khách vãng lai",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Tổng quan</h1>
        <p className="mt-1 text-muted-foreground">
          Dữ liệu được cập nhật mỗi 60 giây (ISR revalidate).
        </p>
      </div>

      {/* 4 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          Icon={Wallet}
          label="Doanh thu tháng"
          value={formatCurrency(revenue)}
          changePercent={revenueChangePercent}
          hint="so với tháng trước"
        />
        <StatCard
          Icon={ShoppingBag}
          label="Đơn hàng tháng"
          value={String(thisMonthOrders)}
        />
        <StatCard
          Icon={UserPlus}
          label="Khách hàng mới"
          value={String(newCustomers)}
          hint="tháng này"
        />
        <StatCard
          Icon={Package}
          label="Sản phẩm đang bán"
          value={String(activeProducts)}
        />
      </div>

      {/* 2 charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold">Doanh thu 12 tháng</h2>
          <RevenueChart data={revenueData} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Đơn hàng theo trạng thái</h2>
          <OrderStatusChart data={statusData} />
        </Card>
      </div>

      {/* Top tables 2 cột */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Top 5 sản phẩm bán chạy (tháng)</h2>
          <TopProductsTable rows={topProducts} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Top 5 khách hàng chi nhiều nhất</h2>
          <TopCustomersTable rows={topCustomers} />
        </Card>
      </div>

      {/* Recent orders full-width */}
      <Card className="p-5">
        <h2 className="mb-4 text-base font-bold">10 đơn hàng mới nhất</h2>
        <RecentOrdersTable orders={recentOrdersForUI} />
      </Card>

      {/* Unread messages */}
      <Card className="p-5">
        <h2 className="mb-4 text-base font-bold">Tin nhắn chưa đọc</h2>
        <UnreadMessagesPanel messages={unreadMessages} />
      </Card>
    </div>
  );
}

import { ShoppingBag, Wallet, Clock, PackageCheck } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Props = {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  deliveredCount: number;
  hint?: string;
};

export function AdminOrderStatsCards({
  totalOrders,
  totalRevenue,
  pendingCount,
  deliveredCount,
  hint,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        Icon={ShoppingBag}
        label="Tổng đơn"
        value={totalOrders.toLocaleString()}
        hint={hint}
      />
      <StatCard
        Icon={Wallet}
        label="Doanh thu"
        value={formatCurrency(totalRevenue)}
        hint="đã thanh toán"
      />
      <StatCard
        Icon={Clock}
        label="Chờ xử lý"
        value={String(pendingCount)}
        hint="cần xác nhận"
        accent
      />
      <StatCard
        Icon={PackageCheck}
        label="Đã giao"
        value={String(deliveredCount)}
        hint="hoàn tất giao hàng"
      />
    </div>
  );
}

function StatCard({
  Icon,
  label,
  value,
  hint,
  accent,
}: {
  Icon: typeof ShoppingBag;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={
            accent
              ? "rounded-md bg-brand-accent/10 p-2 text-brand-accent"
              : "rounded-md bg-brand-primary/10 p-2 text-brand-primary"
          }
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-xl font-bold">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}

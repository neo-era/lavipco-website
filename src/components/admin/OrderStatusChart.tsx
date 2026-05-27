"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { OrderStatus } from "@prisma/client";

import { ORDER_STATUS } from "@/lib/constants";

export type OrderStatusPoint = {
  status: OrderStatus;
  count: number;
};

// Map status → hex color (brand palette)
const COLORS: Record<OrderStatus, string> = {
  PENDING: "#94a3b8", // slate-400
  CONFIRMED: "#0B5FA5", // brand-primary
  PROCESSING: "#F59E0B", // brand-accent
  COMPLETED: "#16a34a", // green-600
  CANCELLED: "#dc2626", // red-600
};

export function OrderStatusChart({ data }: { data: OrderStatusPoint[] }) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Chưa có đơn hàng để thống kê.
      </div>
    );
  }

  const total = filtered.reduce((s, d) => s + d.count, 0);
  const chartData = filtered.map((d) => ({
    name: ORDER_STATUS[d.status].label,
    value: d.count,
    color: COLORS[d.status],
  }));

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} stroke="hsl(var(--background))" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const v = Number(value);
                return [`${v} đơn (${((v / total) * 100).toFixed(0)}%)`, String(name)];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend bên cạnh */}
      <ul className="space-y-2 text-sm">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-foreground/80">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

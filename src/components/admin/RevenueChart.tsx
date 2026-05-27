"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

export type RevenuePoint = {
  /** Label tháng, vd "10/2025" */
  label: string;
  /** Doanh thu VND (chỉ tính đơn PAID) */
  revenue: number;
};

/**
 * Line chart doanh thu 12 tháng gần nhất.
 * Caller (server) tính sẵn data đẩy xuống.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Chưa có dữ liệu doanh thu.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(0)}tr`
                : v >= 1_000
                  ? `${(v / 1_000).toFixed(0)}k`
                  : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--brand-primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--brand-primary))", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

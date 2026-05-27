import { History } from "lucide-react";

import { formatDateTime } from "@/lib/utils";

type Activity = {
  id: string;
  action: string;
  fromValue: string | null;
  toValue: string | null;
  note: string | null;
  createdAt: Date;
  byUser: { name: string | null; email: string | null } | null;
};

const ACTION_LABELS: Record<string, string> = {
  STATUS_CHANGE: "Đổi trạng thái đơn",
  PAYMENT_UPDATE: "Cập nhật thanh toán",
  SHIPPING_UPDATE: "Cập nhật vận chuyển",
  NOTE_ADDED: "Sửa ghi chú nội bộ",
  CANCELLED: "Huỷ đơn",
  REFUNDED: "Hoàn tiền",
  CREATED: "Tạo đơn",
};

const ACTION_COLORS: Record<string, string> = {
  STATUS_CHANGE: "bg-blue-100 text-blue-700",
  PAYMENT_UPDATE: "bg-green-100 text-green-700",
  SHIPPING_UPDATE: "bg-purple-100 text-purple-700",
  NOTE_ADDED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-orange-100 text-orange-700",
  CREATED: "bg-slate-100 text-slate-700",
};

export function OrderActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Chưa có hoạt động nào.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <History className="h-4 w-4 text-brand-primary" />
        Nhật ký hoạt động ({activities.length})
      </h3>
      <ul className="space-y-3">
        {activities.map((a) => {
          const label = ACTION_LABELS[a.action] ?? a.action;
          const color = ACTION_COLORS[a.action] ?? "bg-slate-100 text-slate-700";
          const by = a.byUser?.name || a.byUser?.email || "Hệ thống";
          return (
            <li key={a.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
              <span
                className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${color}`}
              >
                {label}
              </span>
              <div className="min-w-0 flex-1 text-sm">
                {(a.fromValue || a.toValue) && (
                  <p className="text-foreground/80">
                    {a.fromValue && (
                      <span className="line-through opacity-60">{a.fromValue}</span>
                    )}
                    {a.fromValue && a.toValue && (
                      <span className="mx-1 text-muted-foreground">→</span>
                    )}
                    {a.toValue && <span className="font-medium">{a.toValue}</span>}
                  </p>
                )}
                {a.note && (
                  <p className="mt-1 rounded-md bg-muted/40 px-2 py-1 text-xs text-foreground/70">
                    {a.note}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {by} · {formatDateTime(a.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Props = {
  Icon: LucideIcon;
  label: string;
  value: string;
  /** % thay đổi so kỳ trước. undefined = không hiển thị compare. */
  changePercent?: number;
  /** Hint text dưới value (vd: "so với tháng trước"). */
  hint?: string;
  /** Subtext (vd: "Sắp ra mắt"). */
  subtext?: string;
};

export function StatCard({
  Icon,
  label,
  value,
  changePercent,
  hint,
  subtext,
}: Props) {
  const hasChange = typeof changePercent === "number" && Number.isFinite(changePercent);
  const isUp = hasChange && changePercent! > 0;
  const isDown = hasChange && changePercent! < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold leading-tight">{value}</p>
          {subtext && (
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {hasChange && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              isUp && "text-green-600",
              isDown && "text-destructive",
              !isUp && !isDown && "text-muted-foreground",
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {isUp && "+"}
            {changePercent!.toFixed(1)}%
          </span>
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}

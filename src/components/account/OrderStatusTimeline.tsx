import type { OrderStatus, ShippingStatus } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  ORDER_TIMELINE_STEPS,
  getCurrentTimelineStep,
} from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";

type Props = {
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
};

/**
 * Timeline 5 bước (ngang trên desktop, dọc trên mobile).
 * Cancelled → hiển thị badge thay timeline.
 */
export function OrderStatusTimeline({ orderStatus, shippingStatus }: Props) {
  if (orderStatus === "CANCELLED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
        <Badge variant="destructive" className="rounded-full">
          Đơn hàng đã huỷ
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Liên hệ hỗ trợ nếu bạn cần hỗ trợ về đơn này.
        </p>
      </div>
    );
  }

  const currentStep = getCurrentTimelineStep(orderStatus, shippingStatus);

  return (
    <ol className="relative grid gap-4 md:grid-cols-5">
      {ORDER_TIMELINE_STEPS.map((step, idx) => {
        const isPassed = idx <= currentStep;
        const isCurrent = idx === currentStep;
        const isLast = idx === ORDER_TIMELINE_STEPS.length - 1;

        return (
          <li key={step.index} className="relative flex items-start gap-3 md:flex-col md:items-center md:text-center">
            {/* Connector dọc mobile / ngang desktop */}
            {!isLast && (
              <>
                <span
                  className={cn(
                    "absolute left-5 top-10 h-full w-px md:hidden",
                    idx < currentStep ? "bg-brand-primary" : "bg-border",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-5 hidden h-px w-full md:block",
                    idx < currentStep ? "bg-brand-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              </>
            )}

            {/* Dot icon */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 transition-colors",
                isPassed
                  ? "border-background bg-brand-primary text-white shadow-sm"
                  : "border-background bg-muted text-muted-foreground",
                isCurrent && "ring-2 ring-brand-primary/30",
              )}
            >
              <step.Icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <div className="flex-1 md:mt-2">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  isPassed ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="mt-0.5 text-xs text-brand-primary">Trạng thái hiện tại</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

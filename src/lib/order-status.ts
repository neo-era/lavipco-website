/**
 * Mapping Order status → step timeline (UI dùng).
 * 5 bước: Đặt hàng → Xác nhận → Đóng gói → Vận chuyển → Hoàn thành.
 *
 * Combine `orderStatus` (PENDING/CONFIRMED/PROCESSING/COMPLETED/CANCELLED)
 * và `shippingStatus` (PENDING/PROCESSING/SHIPPED/DELIVERED/RETURNED) để
 * tính bước hiện tại.
 *
 * Trường hợp CANCELLED: trả -1, UI hiển thị badge "Đã huỷ" thay timeline.
 */
import {
  ShoppingCart,
  CheckCircle,
  Package,
  Truck,
  PackageCheck,
} from "lucide-react";
import type {
  OrderStatus as PrismaOrderStatus,
  ShippingStatus as PrismaShippingStatus,
} from "@prisma/client";

export type TimelineStep = {
  index: number;
  label: string;
  Icon: typeof ShoppingCart;
};

export const ORDER_TIMELINE_STEPS: TimelineStep[] = [
  { index: 0, label: "Đặt hàng", Icon: ShoppingCart },
  { index: 1, label: "Xác nhận", Icon: CheckCircle },
  { index: 2, label: "Đóng gói", Icon: Package },
  { index: 3, label: "Vận chuyển", Icon: Truck },
  { index: 4, label: "Hoàn thành", Icon: PackageCheck },
];

/**
 * Trả về step index hiện tại (0-4) hoặc -1 nếu đã huỷ.
 * Step được coi là "đã qua" nếu index <= currentStep.
 */
export function getCurrentTimelineStep(
  orderStatus: PrismaOrderStatus,
  shippingStatus: PrismaShippingStatus,
): number {
  if (orderStatus === "CANCELLED") return -1;
  if (orderStatus === "COMPLETED" || shippingStatus === "DELIVERED") return 4;
  if (shippingStatus === "SHIPPED") return 3;
  if (orderStatus === "PROCESSING" || shippingStatus === "PROCESSING") return 2;
  if (orderStatus === "CONFIRMED") return 1;
  return 0; // PENDING
}

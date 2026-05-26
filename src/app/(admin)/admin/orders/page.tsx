import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <PlaceholderSection
      title="Quản lý đơn hàng"
      description="Danh sách đơn hàng, lọc theo trạng thái, cập nhật trạng thái thanh toán và giao hàng."
      phase="Giai đoạn 5"
    />
  );
}

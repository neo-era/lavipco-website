import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Tổng quan" };

export default function AdminDashboardPage() {
  return (
    <PlaceholderSection
      title="Tổng quan"
      description="Thống kê đơn hàng, doanh thu, yêu cầu báo giá, sản phẩm bán chạy và biểu đồ truy cập."
      phase="Giai đoạn 5"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
};

export default function MyOrdersPage() {
  return (
    <PlaceholderSection
      title="Đơn hàng của tôi"
      description="Lịch sử đơn hàng, trạng thái thanh toán và giao hàng. Click vào từng đơn để xem chi tiết."
      phase="Giai đoạn 4"
    />
  );
}

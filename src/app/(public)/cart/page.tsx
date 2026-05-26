import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Giỏ hàng",
};

export default function CartPage() {
  return (
    <PlaceholderSection
      title="Giỏ hàng"
      description="Trang xem giỏ hàng, cập nhật số lượng, áp mã giảm giá và chuyển đến trang thanh toán."
      phase="Giai đoạn 4"
    />
  );
}

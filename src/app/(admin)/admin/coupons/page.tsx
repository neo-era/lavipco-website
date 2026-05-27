import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Khuyến mãi" };

export default function AdminCouponsPage() {
  return (
    <PlaceholderSection
      title="Quản lý mã giảm giá"
      description="CRUD coupon: code, loại (PERCENT/FIXED), giá trị, giá trị đơn tối thiểu, ngày bắt đầu/kết thúc, usage limit."
      phase="Giai đoạn 5"
    />
  );
}

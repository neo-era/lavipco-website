import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "Đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, chiếu sáng cảnh quan và hạ tầng điện.",
};

export default function ServicesPage() {
  return (
    <PlaceholderSection
      title="Dịch vụ kỹ thuật LAVIPCO"
      description="Trang chi tiết các nhóm dịch vụ chính: đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, chiếu sáng cảnh quan và hạ tầng điện."
      phase="Giai đoạn 2"
    />
  );
}

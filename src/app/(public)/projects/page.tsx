import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Portfolio các dự án LAVIPCO đã triển khai.",
};

export default function ProjectsPage() {
  return (
    <PlaceholderSection
      title="Dự án đã thực hiện"
      description="Portfolio đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, cảnh quan và Smart City — phân loại theo nhóm."
      phase="Giai đoạn 2"
    />
  );
}

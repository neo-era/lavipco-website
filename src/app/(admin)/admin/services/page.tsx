import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Dịch vụ" };

export default function AdminServicesPage() {
  return (
    <PlaceholderSection
      title="Quản lý dịch vụ"
      description="CRUD dịch vụ hiển thị ở trang công khai: tiêu đề, mô tả, icon, sắp xếp."
      phase="Giai đoạn 5"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Dự án" };

export default function AdminProjectsPage() {
  return (
    <PlaceholderSection
      title="Quản lý dự án (portfolio)"
      description="CRUD dự án: tiêu đề, mô tả, ảnh gallery, chủ đầu tư, địa điểm, năm, quy mô, nhóm."
      phase="Giai đoạn 5"
    />
  );
}

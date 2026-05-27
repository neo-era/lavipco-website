import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Danh mục" };

export default function AdminCategoriesPage() {
  return (
    <PlaceholderSection
      title="Quản lý danh mục sản phẩm"
      description="CRUD danh mục: tên, slug, parent (cây phân cấp), ảnh đại diện, sắp xếp, ẩn/hiện."
      phase="Giai đoạn 5"
    />
  );
}

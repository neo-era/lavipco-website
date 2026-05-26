import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function AdminProductsPage() {
  return (
    <PlaceholderSection
      title="Quản lý sản phẩm"
      description="CRUD sản phẩm, biến thể, ảnh, thông số kỹ thuật, danh mục và trạng thái hiển thị."
      phase="Giai đoạn 3"
    />
  );
}

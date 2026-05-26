import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Catalog sản phẩm: đèn LED, đèn tín hiệu, tủ điều khiển và phụ kiện.",
};

export default function ProductsPage() {
  return (
    <PlaceholderSection
      title="Sản phẩm LAVIPCO"
      description="Catalog đèn LED, đèn tín hiệu, tủ điều khiển, phụ kiện — kèm bộ lọc thông số kỹ thuật và yêu cầu báo giá."
      phase="Giai đoạn 3"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Khách hàng" };

export default function AdminCustomersPage() {
  return (
    <PlaceholderSection
      title="Quản lý khách hàng"
      description="Danh sách user, phân quyền (USER/STAFF/ADMIN), lịch sử đơn hàng và sổ địa chỉ."
      phase="Giai đoạn 5"
    />
  );
}

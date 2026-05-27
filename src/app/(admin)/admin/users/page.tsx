import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage() {
  return (
    <PlaceholderSection
      title="Quản lý người dùng (admin/staff)"
      description="CRUD user với role USER/STAFF/ADMIN. Cấp quyền, đặt lại mật khẩu, vô hiệu hoá tài khoản."
      phase="Giai đoạn 5"
    />
  );
}

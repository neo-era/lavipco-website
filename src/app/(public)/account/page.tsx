import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Tài khoản",
};

export default function AccountPage() {
  return (
    <PlaceholderSection
      title="Tài khoản của tôi"
      description="Quản lý thông tin cá nhân, sổ địa chỉ, lịch sử đơn hàng, yêu cầu báo giá đã gửi và đổi mật khẩu."
      phase="Giai đoạn 4"
    />
  );
}

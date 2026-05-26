import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Cài đặt" };

export default function AdminSettingsPage() {
  return (
    <PlaceholderSection
      title="Cài đặt website"
      description="Cấu hình toàn site: hotline, email, địa chỉ, MST, logo, social, SEO defaults — lưu vào bảng Setting."
      phase="Giai đoạn 5"
    />
  );
}

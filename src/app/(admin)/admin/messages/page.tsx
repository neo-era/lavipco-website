import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Tin nhắn liên hệ" };

export default function AdminMessagesPage() {
  return (
    <PlaceholderSection
      title="Tin nhắn liên hệ"
      description="Danh sách ContactMessage từ form Liên hệ và Yêu cầu báo giá. Filter theo trạng thái (NEW/READ/REPLIED/CLOSED), search, reply qua email."
      phase="Giai đoạn 5"
    />
  );
}

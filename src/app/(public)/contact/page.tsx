import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với LAVIPCO để được tư vấn kỹ thuật và báo giá.",
};

export default function ContactPage() {
  return (
    <PlaceholderSection
      title="Liên hệ LAVIPCO"
      description="Form liên hệ, yêu cầu báo giá, thông tin hotline và bản đồ trụ sở."
      phase="Giai đoạn 2"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Giới thiệu Công ty TNHH Kỹ Nghệ Lâm Việt Phát (LAVIPCO) - năng lực, đội ngũ và lĩnh vực hoạt động.",
};

export default function AboutPage() {
  return (
    <PlaceholderSection
      title="Về LAVIPCO"
      description="Năng lực, đội ngũ, lịch sử phát triển và lĩnh vực hoạt động của Công ty TNHH Kỹ Nghệ Lâm Việt Phát."
      phase="Giai đoạn 2"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức, bài viết kỹ thuật và cập nhật từ LAVIPCO.",
};

export default function BlogPage() {
  return (
    <PlaceholderSection
      title="Tin tức & Bài viết"
      description="Cập nhật chuyên môn kỹ thuật, dự án mới và tin tức ngành chiếu sáng đô thị."
      phase="Giai đoạn 2"
    />
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = { title: "Tin tức" };

export default function AdminBlogPage() {
  return (
    <PlaceholderSection
      title="Quản lý tin tức"
      description="CRUD bài viết, soạn nội dung MDX/HTML, gắn tags, đặt ảnh bìa, xếp lịch publish."
      phase="Giai đoạn 5"
    />
  );
}

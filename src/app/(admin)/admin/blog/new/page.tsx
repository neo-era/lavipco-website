import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { BlogPostInput } from "@/lib/validations/admin-blog";
import { isAIEnabled } from "@/lib/actions/ai-content";
import { Button } from "@/components/ui/button";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";

export const metadata: Metadata = { title: "Thêm bài viết" };

const DEFAULT_VALUES: BlogPostInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  tags: [],
  publishedAt: null,
  isPublished: false,
  metaTitle: "",
  metaDescription: "",
};

export default async function NewBlogPostPage() {
  const aiEnabled = await isAIEnabled();
  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/blog">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm bài viết mới</h1>
      </div>
      <AdminBlogForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        aiEnabled={aiEnabled}
      />
    </div>
  );
}

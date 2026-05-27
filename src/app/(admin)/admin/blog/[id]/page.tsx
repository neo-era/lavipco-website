import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { db } from "@/lib/db";
import type { BlogPostInput } from "@/lib/validations/admin-blog";
import { Button } from "@/components/ui/button";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";

export const metadata: Metadata = { title: "Sửa bài viết" };

function toDatetimeLocal(date: Date | null): string | null {
  if (!date) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const defaultValues: BlogPostInput = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImage: post.coverImage ?? "",
    tags: post.tags,
    publishedAt: toDatetimeLocal(post.publishedAt),
    isPublished: post.isPublished,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
  };

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/blog">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">{post.title}</h1>
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          Xem trang public <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <AdminBlogForm mode="edit" postId={post.id} defaultValues={defaultValues} />
    </div>
  );
}

"use client";

import { deleteBlogPost } from "@/lib/actions/admin-blog";
import { DeleteRowAction } from "@/components/admin/shared/DeleteRowAction";

export function DeleteBlogPostAction({
  id,
  title,
  slug,
}: {
  id: string;
  title: string;
  slug: string;
}) {
  return (
    <DeleteRowAction
      label={title}
      editHref={`/admin/blog/${id}`}
      publicHref={`/blog/${slug}`}
      entityName="bài viết"
      onDelete={() => deleteBlogPost(id)}
    />
  );
}

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  blogPostInputSchema,
  type BlogPostInput,
} from "@/lib/validations/admin-blog";
import { blogImportConfig } from "@/lib/excel/configs/blog";
import { runImport } from "@/lib/excel/runner";
import type { ImportResult } from "@/lib/excel/types";

async function requireAdminId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
  return session.user.id;
}

function blogSlugExists(slug: string): Promise<boolean> {
  return db.blogPost
    .findUnique({ where: { slug }, select: { id: true } })
    .then(Boolean);
}

export async function previewImportBlog(base64: string): Promise<ImportResult> {
  await requireAdminId();
  return runImport<BlogPostInput>({
    base64,
    config: blogImportConfig,
    schema: blogPostInputSchema,
    dryRun: true,
    slugExists: blogSlugExists,
  });
}

export async function runImportBlog(base64: string): Promise<ImportResult> {
  const adminId = await requireAdminId();
  const res = await runImport<BlogPostInput>({
    base64,
    config: blogImportConfig,
    schema: blogPostInputSchema,
    dryRun: false,
    slugExists: blogSlugExists,
    upsert: async (data, slug) => {
      const content = sanitizeHtml(data.content);
      const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
      const common = {
        title: data.title,
        excerpt: data.excerpt ?? null,
        content,
        coverImage: data.coverImage ?? null,
        tags: data.tags,
        publishedAt,
        isPublished: data.isPublished,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      };
      await db.blogPost.upsert({
        where: { slug },
        create: { slug, ...common, authorId: adminId },
        update: common,
      });
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return res;
}

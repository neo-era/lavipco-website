"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  blogPostInputSchema,
  type BlogPostInput,
} from "@/lib/validations/admin-blog";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
  return { userId: session.user.id };
}

async function processCoverImage(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return await uploadImage(src);
  return null;
}

export async function createBlogPost(
  input: BlogPostInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = blogPostInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }
  const data = parsed.data;

  try {
    const conflict = await db.blogPost.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (conflict) {
      return {
        ok: false,
        error: "Slug đã tồn tại",
        fieldErrors: { slug: ["Slug đã được dùng"] },
      };
    }

    const coverImage = await processCoverImage(data.coverImage);
    // Sanitize HTML từ Tiptap trước khi lưu (defense-in-depth)
    const content = sanitizeHtml(data.content);

    const post = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content,
        coverImage,
        tags: data.tags,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        isPublished: data.isPublished,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        authorId: admin.userId,
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return { ok: true, data: post };
  } catch (error) {
    console.error("[createBlogPost]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateBlogPost(
  id: string,
  input: BlogPostInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = blogPostInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }
  const data = parsed.data;

  try {
    const existing = await db.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) return { ok: false, error: "Không tìm thấy bài viết" };

    if (data.slug !== existing.slug) {
      const conflict = await db.blogPost.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (conflict) {
        return {
          ok: false,
          error: "Slug đã tồn tại",
          fieldErrors: { slug: ["Slug đã được dùng"] },
        };
      }
    }

    const coverImage = await processCoverImage(data.coverImage);
    const content = sanitizeHtml(data.content);

    await db.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content,
        coverImage,
        tags: data.tags,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        isPublished: data.isPublished,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    if (data.slug !== existing.slug) revalidatePath(`/blog/${existing.slug}`);
    return { ok: true, data: { id, slug: data.slug } };
  } catch (error) {
    console.error("[updateBlogPost]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!post) return { ok: false, error: "Không tìm thấy bài viết" };

    await db.blogPost.delete({ where: { id } });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteBlogPost]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

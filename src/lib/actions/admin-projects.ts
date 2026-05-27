"use server";

/**
 * Admin project CRUD actions.
 */
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import {
  projectInputSchema,
  type ProjectInput,
} from "@/lib/validations/admin-project";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

async function processImages(images: string[]): Promise<string[]> {
  const processed: string[] = [];
  for (const img of images) {
    if (img.startsWith("http://") || img.startsWith("https://")) {
      processed.push(img);
    } else if (img.startsWith("data:")) {
      processed.push(await uploadImage(img));
    }
  }
  return processed;
}

export async function createProject(
  input: ProjectInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = projectInputSchema.safeParse(input);
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
    const conflict = await db.project.findUnique({
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

    const images = await processImages(data.images);

    const project = await db.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? null,
        description: data.description ?? null,
        client: data.client ?? null,
        location: data.location ?? null,
        year: data.year ?? null,
        scale: data.scale ?? null,
        category: data.category,
        images,
        videoUrl: data.videoUrl ?? null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { ok: true, data: project };
  } catch (error) {
    console.error("[createProject]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = projectInputSchema.safeParse(input);
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
    const existing = await db.project.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) return { ok: false, error: "Không tìm thấy dự án" };

    if (data.slug !== existing.slug) {
      const conflict = await db.project.findUnique({
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

    const images = await processImages(data.images);

    await db.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? null,
        description: data.description ?? null,
        client: data.client ?? null,
        location: data.location ?? null,
        year: data.year ?? null,
        scale: data.scale ?? null,
        category: data.category,
        images,
        videoUrl: data.videoUrl ?? null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.slug}`);
    if (data.slug !== existing.slug) revalidatePath(`/projects/${existing.slug}`);
    return { ok: true, data: { id, slug: data.slug } };
  } catch (error) {
    console.error("[updateProject]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const project = await db.project.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!project) return { ok: false, error: "Không tìm thấy dự án" };

    await db.project.delete({ where: { id } });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteProject]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

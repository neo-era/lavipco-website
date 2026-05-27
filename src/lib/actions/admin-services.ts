"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import {
  serviceInputSchema,
  type ServiceInput,
} from "@/lib/validations/admin-service";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

async function processCoverImage(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return await uploadImage(src);
  return null;
}

export async function createService(
  input: ServiceInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = serviceInputSchema.safeParse(input);
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
    const conflict = await db.service.findUnique({
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

    const service = await db.service.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription ?? null,
        description: data.description,
        icon: data.icon ?? null,
        coverImage,
        price:
          data.price !== undefined && data.price !== null
            ? new Prisma.Decimal(data.price)
            : null,
        processSteps:
          data.processSteps.length > 0
            ? (data.processSteps as Prisma.JsonArray)
            : Prisma.JsonNull,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);
    return { ok: true, data: service };
  } catch (error) {
    console.error("[createService]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateService(
  id: string,
  input: ServiceInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = serviceInputSchema.safeParse(input);
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
    const existing = await db.service.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) return { ok: false, error: "Không tìm thấy dịch vụ" };

    if (data.slug !== existing.slug) {
      const conflict = await db.service.findUnique({
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

    await db.service.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription ?? null,
        description: data.description,
        icon: data.icon ?? null,
        coverImage,
        price:
          data.price !== undefined && data.price !== null
            ? new Prisma.Decimal(data.price)
            : null,
        processSteps:
          data.processSteps.length > 0
            ? (data.processSteps as Prisma.JsonArray)
            : Prisma.JsonNull,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath(`/services/${data.slug}`);
    if (data.slug !== existing.slug) revalidatePath(`/services/${existing.slug}`);
    return { ok: true, data: { id, slug: data.slug } };
  } catch (error) {
    console.error("[updateService]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const service = await db.service.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!service) return { ok: false, error: "Không tìm thấy dịch vụ" };

    await db.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteService]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

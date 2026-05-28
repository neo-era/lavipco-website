"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import {
  categoryInputSchema,
  type CategoryInput,
} from "@/lib/validations/admin-category";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

async function processImage(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("data:")) return await uploadImage(src);
  return null;
}

/** Chuẩn hoá parentId: chuỗi rỗng → null. */
function normalizeParentId(raw: string | null | undefined): string | null {
  return raw && raw.length > 0 ? raw : null;
}

/**
 * Kiểm tra việc gán `newParentId` làm cha của `selfId` có tạo vòng lặp không.
 * Đi ngược lên chuỗi cha từ newParentId; nếu gặp lại selfId → vòng lặp.
 */
async function wouldCreateCycle(
  selfId: string,
  newParentId: string,
): Promise<boolean> {
  let cursor: string | null = newParentId;
  const visited = new Set<string>();
  while (cursor) {
    if (cursor === selfId) return true;
    if (visited.has(cursor)) break; // an toàn nếu DB đã có cycle sẵn
    visited.add(cursor);
    const parent: { parentId: string | null } | null =
      await db.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
    cursor = parent?.parentId ?? null;
  }
  return false;
}

export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = categoryInputSchema.safeParse(input);
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
  const parentId = normalizeParentId(data.parentId);

  try {
    const conflict = await db.category.findUnique({
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

    if (parentId) {
      const parent = await db.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parent) {
        return {
          ok: false,
          error: "Danh mục cha không tồn tại",
          fieldErrors: { parentId: ["Danh mục cha không hợp lệ"] },
        };
      }
    }

    const image = await processImage(data.image);

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image,
        parentId,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { ok: true, data: category };
  } catch (error) {
    console.error("[createCategory]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = categoryInputSchema.safeParse(input);
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
  const parentId = normalizeParentId(data.parentId);

  try {
    const existing = await db.category.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) return { ok: false, error: "Không tìm thấy danh mục" };

    if (data.slug !== existing.slug) {
      const conflict = await db.category.findUnique({
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

    if (parentId) {
      if (parentId === id) {
        return {
          ok: false,
          error: "Không thể chọn chính nó làm danh mục cha",
          fieldErrors: { parentId: ["Không thể chọn chính nó"] },
        };
      }
      const parent = await db.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parent) {
        return {
          ok: false,
          error: "Danh mục cha không tồn tại",
          fieldErrors: { parentId: ["Danh mục cha không hợp lệ"] },
        };
      }
      if (await wouldCreateCycle(id, parentId)) {
        return {
          ok: false,
          error: "Không thể chọn danh mục con/cháu làm cha (gây vòng lặp)",
          fieldErrors: { parentId: ["Gây vòng lặp phân cấp"] },
        };
      }
    }

    const image = await processImage(data.image);

    await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image,
        parentId,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { ok: true, data: { id, slug: data.slug } };
  } catch (error) {
    console.error("[updateCategory]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const category = await db.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { products: true } } },
    });
    if (!category) return { ok: false, error: "Không tìm thấy danh mục" };

    if (category._count.products > 0) {
      return {
        ok: false,
        error: `Danh mục còn ${category._count.products} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xoá.`,
      };
    }

    // Danh mục con sẽ tự lên cấp gốc (parentId = null) do quan hệ onDelete: SetNull
    await db.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { ok: true };
  } catch (error) {
    console.error("[deleteCategory]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

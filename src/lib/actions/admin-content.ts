"use server";

/**
 * Admin actions cho CMS nội dung trang (trang chủ + giới thiệu).
 * Lưu JSON vào bảng Setting (1 key/section). Ảnh (data URL) tự upload Cloudinary.
 */
import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { getContent } from "@/lib/content";
import {
  contentSchemas,
  type ContentKey,
  type ContentValue,
} from "@/lib/content/schema";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

/**
 * Duyệt sâu object/array: field string dạng data URL → upload Cloudinary, trả URL.
 * Các string khác (heading, href...) giữ nguyên — chỉ "data:" mới upload.
 */
async function processImagesDeep(value: unknown): Promise<unknown> {
  if (typeof value === "string") {
    return value.startsWith("data:") ? await uploadImage(value) : value;
  }
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const item of value) out.push(await processImagesDeep(item));
    return out;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await processImagesDeep(v);
    }
    return out;
  }
  return value;
}

/** Đọc nội dung 1 section để init form admin (merge default nếu chưa có). */
export async function loadContentSection<K extends ContentKey>(
  key: K,
): Promise<ContentValue<K>> {
  return getContent(key);
}

/** Lưu nội dung 1 section. require ADMIN + validate + upload ảnh + revalidate. */
export async function updateContentSection<K extends ContentKey>(
  key: K,
  data: ContentValue<K>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const schema = contentSchemas[key] as unknown as z.ZodType<ContentValue<K>>;
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }

  try {
    const processed = await processImagesDeep(parsed.data);
    const value = JSON.stringify(processed);

    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (error) {
    console.error("[updateContentSection]", key, error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

"use server";

/**
 * Admin customer actions: tags, lock, internal note.
 * Không hỗ trợ delete user qua admin panel - chỉ lock thay vì xoá để giữ
 * tham chiếu Order (onDelete: SetNull).
 */
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  updateCustomerTagsSchema,
  updateCustomerNoteSchema,
  type UpdateCustomerTagsInput,
  type UpdateCustomerNoteInput,
} from "@/lib/validations/admin-customer";

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

export async function updateCustomerTags(
  customerId: string,
  input: UpdateCustomerTagsInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const parsed = updateCustomerTagsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const customer = await db.user.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) return { ok: false, error: "Không tìm thấy khách hàng" };

    // Normalize tags: trim + dedupe, giữ thứ tự
    const normalized = Array.from(
      new Set(parsed.data.tags.map((t) => t.trim()).filter(Boolean)),
    );

    await db.user.update({
      where: { id: customerId },
      data: { tags: normalized },
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateCustomerTags]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function toggleCustomerLock(
  customerId: string,
): Promise<ActionResult<{ isLocked: boolean }>> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const customer = await db.user.findUnique({
      where: { id: customerId },
      select: { id: true, isLocked: true, role: true },
    });
    if (!customer) return { ok: false, error: "Không tìm thấy khách hàng" };

    // Không cho admin khoá chính mình
    if (customer.id === admin.userId) {
      return { ok: false, error: "Không thể khoá tài khoản đang đăng nhập" };
    }
    // Không cho khoá ADMIN khác (tránh khoá ngoài ý muốn)
    if (customer.role === "ADMIN") {
      return { ok: false, error: "Không thể khoá tài khoản ADMIN" };
    }

    const next = !customer.isLocked;
    await db.user.update({
      where: { id: customerId },
      data: {
        isLocked: next,
        // Khi khoá → invalidate sessions hiện hành (Auth.js sẽ check ở login lần sau)
      },
    });

    // Xoá toàn bộ session đang mở để khoá có hiệu lực ngay
    if (next) {
      await db.session.deleteMany({ where: { userId: customerId } });
    }

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    return { ok: true, data: { isLocked: next } };
  } catch (error) {
    console.error("[toggleCustomerLock]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateCustomerNote(
  customerId: string,
  input: UpdateCustomerNoteInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const parsed = updateCustomerNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const customer = await db.user.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) return { ok: false, error: "Không tìm thấy khách hàng" };

    await db.user.update({
      where: { id: customerId },
      data: { adminNote: parsed.data.note || null },
    });

    revalidatePath(`/admin/customers/${customerId}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateCustomerNote]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

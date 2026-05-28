"use server";

/**
 * Admin customer actions: tags, lock, internal note.
 * Không hỗ trợ delete user qua admin panel - chỉ lock thay vì xoá để giữ
 * tham chiếu Order (onDelete: SetNull).
 */
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  updateCustomerTagsSchema,
  updateCustomerNoteSchema,
  type UpdateCustomerTagsInput,
  type UpdateCustomerNoteInput,
} from "@/lib/validations/admin-customer";
import {
  updateUserRoleSchema,
  resetUserPasswordSchema,
  createInternalUserSchema,
  type UpdateUserRoleInput,
  type ResetUserPasswordInput,
  type CreateInternalUserInput,
} from "@/lib/validations/admin-user";

const BCRYPT_ROUNDS = 12;

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

/**
 * Đổi vai trò (USER/STAFF/ADMIN).
 * Bảo vệ: không cho tự đổi vai trò mình; không cho hạ cấp ADMIN cuối cùng.
 * Lưu ý: session dùng JWT nên thay đổi có hiệu lực hoàn toàn ở lần đăng nhập sau.
 */
export async function updateUserRole(
  userId: string,
  input: UpdateUserRoleInput,
): Promise<ActionResult<{ role: "USER" | "STAFF" | "ADMIN" }>> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { role } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) return { ok: false, error: "Không tìm thấy người dùng" };

    if (user.id === admin.userId) {
      return { ok: false, error: "Không thể tự đổi vai trò của chính mình" };
    }

    // Không cho hạ cấp ADMIN cuối cùng (tránh mất quyền quản trị toàn hệ thống)
    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return {
          ok: false,
          error: "Phải còn ít nhất 1 ADMIN. Hãy cấp quyền ADMIN cho người khác trước.",
        };
      }
    }

    if (user.role === role) {
      return { ok: true, data: { role } };
    }

    await db.user.update({ where: { id: userId }, data: { role } });
    // Xoá session để vai trò mới áp dụng ở lần đăng nhập kế tiếp
    await db.session.deleteMany({ where: { userId } });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${userId}`);
    revalidatePath("/admin/users");
    return { ok: true, data: { role } };
  } catch (error) {
    console.error("[updateUserRole]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

/**
 * Đặt lại mật khẩu cho user (admin thao tác).
 * Hash bcrypt saltRounds=12; xoá session để buộc đăng nhập lại.
 */
export async function resetUserPassword(
  userId: string,
  input: ResetUserPasswordInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const parsed = resetUserPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Mật khẩu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return { ok: false, error: "Không tìm thấy người dùng" };

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
    await db.user.update({ where: { id: userId }, data: { hashedPassword } });
    await db.session.deleteMany({ where: { userId } });

    revalidatePath(`/admin/customers/${userId}`);
    return { ok: true };
  } catch (error) {
    console.error("[resetUserPassword]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

/**
 * Tạo tài khoản nội bộ STAFF/ADMIN (admin thao tác trực tiếp).
 */
export async function createInternalUser(
  input: CreateInternalUserInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const parsed = createInternalUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, password, role } = parsed.data;

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return {
        ok: false,
        error: "Email đã được sử dụng",
        fieldErrors: { email: ["Email đã tồn tại"] },
      };
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await db.user.create({
      data: { name, email, hashedPassword, role, emailVerified: new Date() },
      select: { id: true },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/customers");
    return { ok: true, data: user };
  } catch (error) {
    console.error("[createInternalUser]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

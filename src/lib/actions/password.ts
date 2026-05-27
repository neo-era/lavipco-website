"use server";

import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/password";
import { authLimiter, checkRateLimit } from "@/lib/rate-limit";

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof ChangePasswordInput, string[]>>;
    };

const BCRYPT_ROUNDS = 12; // theo CLAUDE.md mục 9

/**
 * Đổi mật khẩu cho user đang login.
 *  1. Verify currentPassword khớp với hashedPassword DB
 *  2. Hash newPassword với bcryptjs saltRounds=12
 *  3. Update user.hashedPassword
 *
 * Lưu ý: user OAuth (Google) có thể chưa có hashedPassword → trả lỗi
 * hướng dẫn họ đặt mật khẩu lần đầu thay vì đổi.
 */
export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<keyof ChangePasswordInput, string[]>
      >,
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Bạn cần đăng nhập để đổi mật khẩu" };
  }

  // Rate limit theo user.id để chống brute force currentPassword
  const rl = await checkRateLimit(authLimiter, "change-password", session.user.id);
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, hashedPassword: true },
  });
  if (!user) {
    return { ok: false, error: "Không tìm thấy tài khoản" };
  }

  if (!user.hashedPassword) {
    return {
      ok: false,
      error:
        "Tài khoản đăng nhập qua OAuth (Google) chưa đặt mật khẩu. Liên hệ hỗ trợ để được hướng dẫn đặt mật khẩu.",
    };
  }

  const match = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword);
  if (!match) {
    return {
      ok: false,
      error: "Mật khẩu hiện tại không đúng",
      fieldErrors: { currentPassword: ["Mật khẩu hiện tại không đúng"] },
    };
  }

  const newHashed = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
  await db.user.update({
    where: { id: user.id },
    data: { hashedPassword: newHashed },
  });

  return { ok: true };
}

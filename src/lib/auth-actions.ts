"use server";

/**
 * Server Actions cho luồng xác thực.
 * Form ở /sign-in và /sign-up gọi trực tiếp các action này — không cần API route
 * (trừ /api/auth/register dành cho client bên ngoài, ví dụ mobile app).
 *
 * Bảo mật:
 *  - Rate limit 5 lần / 15 phút / IP cho mọi auth attempt (signin/signup).
 *  - Brute force protect: thêm key theo email để cả attacker không brute IP rotation
 *    cũng không brute single email với nhiều IP.
 */
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn, signOut } from "./auth";
import { db } from "./db";
import { signInSchema, signUpSchema } from "./validations/auth";
import { authLimiter, checkRateLimit } from "./rate-limit";

export type AuthFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

/**
 * Đăng nhập bằng email + password (Credentials provider).
 * Sau khi đăng nhập thành công, signIn() sẽ throw NEXT_REDIRECT — phải re-throw
 * để Next.js xử lý chuyển hướng.
 */
export async function signInAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Rate limit theo IP + email (chống brute force cả 2 chiều)
  const emailKey = parsed.data.email.toLowerCase();
  const rl = await checkRateLimit(authLimiter, "signin", emailKey);
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: callbackUrl,
    });
    // Không bao giờ chạy tới đây do redirect throw.
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, error: "Email hoặc mật khẩu không đúng" };
      }
      return { ok: false, error: "Đăng nhập thất bại, thử lại sau" };
    }
    // Re-throw redirect errors (NEXT_REDIRECT) để Next.js xử lý
    throw error;
  }
}

/**
 * Đăng ký tài khoản mới và đăng nhập luôn.
 * Hash password với bcrypt saltRounds=12 theo CLAUDE.md mục 9.
 */
export async function signUpAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, password } = parsed.data;

  // Rate limit signup theo IP (cùng quota auth)
  const rl = await checkRateLimit(authLimiter, "signup");
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Email đã được sử dụng" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { name, email, hashedPassword, role: "USER" },
  });

  // Đăng nhập luôn
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // User đã tạo nhưng signIn lỗi — yêu cầu login thủ công
      return {
        ok: false,
        error: "Đã tạo tài khoản nhưng không tự đăng nhập được. Vui lòng đăng nhập thủ công.",
      };
    }
    throw error;
  }
}

/**
 * Bắt đầu luồng OAuth với Google. Server Action — gọi từ form action.
 */
export async function signInWithGoogleAction(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/" });
}

/** Đăng xuất và quay về trang chủ. */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

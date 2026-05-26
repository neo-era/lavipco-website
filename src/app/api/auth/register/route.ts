/**
 * POST /api/auth/register
 *
 * Đăng ký tài khoản qua API JSON. Dùng cho client bên ngoài (mobile app, third-party).
 * Web form ưu tiên dùng Server Action `signUpAction` thay vì gọi endpoint này.
 *
 * Body:
 *   { name: string, email: string, password: string, confirmPassword: string }
 *
 * Response:
 *   201 { id, email, name, role } — thành công
 *   400 { error: "Validation error", fieldErrors }
 *   409 { error: "Email đã tồn tại" }
 *   500 { error: "Lỗi server" }
 */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name, email, hashedPassword, role: "USER" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Lỗi server, thử lại sau" }, { status: 500 });
  }
}

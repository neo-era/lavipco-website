/**
 * Zod schema cho admin quản lý người dùng: đổi role, đặt lại mật khẩu,
 * tạo tài khoản nội bộ (STAFF/ADMIN).
 */
import { z } from "zod";

import { emailSchema, fullNameSchema, passwordSchema } from "./shared";

export const userRoleSchema = z.enum(["USER", "STAFF", "ADMIN"]);
export type UserRoleValue = z.infer<typeof userRoleSchema>;

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const resetUserPasswordSchema = z.object({
  newPassword: passwordSchema,
});
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;

/** Tạo tài khoản nội bộ — chỉ STAFF hoặc ADMIN (USER thì tự đăng ký). */
export const createInternalUserSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["STAFF", "ADMIN"]),
});
export type CreateInternalUserInput = z.infer<typeof createInternalUserSchema>;

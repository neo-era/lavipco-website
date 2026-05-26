/**
 * Zod schema cho luồng xác thực (sign-in, sign-up, register).
 * Dùng chung cho Server Actions và API routes để tránh trùng logic validate.
 */
import { z } from "zod";

import { emailSchema, passwordSchema, fullNameSchema } from "./shared";

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

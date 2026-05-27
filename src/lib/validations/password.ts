import { z } from "zod";

import { passwordSchema } from "./shared";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

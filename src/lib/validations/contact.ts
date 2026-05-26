/**
 * Zod schema cho form Liên hệ (/contact).
 */
import { z } from "zod";

import { emailSchema, fullNameSchema, phoneVNSchema } from "./shared";

export const CONTACT_SUBJECTS = [
  "Tư vấn sản phẩm",
  "Yêu cầu báo giá",
  "Hợp tác",
  "Khác",
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const contactSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  phone: phoneVNSchema,
  subject: z.enum(CONTACT_SUBJECTS, { message: "Vui lòng chọn tiêu đề" }),
  message: z
    .string()
    .min(10, { message: "Nội dung tối thiểu 10 ký tự" })
    .max(2000, { message: "Nội dung tối đa 2000 ký tự" }),
});

export type ContactInput = z.infer<typeof contactSchema>;

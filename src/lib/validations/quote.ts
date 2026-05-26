/**
 * Zod schema cho form Yêu cầu báo giá từ trang chi tiết dịch vụ/sản phẩm.
 *
 * Subject sẽ được Server Action tự generate theo định dạng
 * "Báo giá: <tên dịch vụ/sản phẩm>" — client không cần nhập.
 */
import { z } from "zod";

import { emailSchema, fullNameSchema, phoneVNSchema } from "./shared";

export const quoteRequestSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  phone: phoneVNSchema,
  message: z
    .string()
    .min(10, { message: "Vui lòng mô tả yêu cầu (tối thiểu 10 ký tự)" })
    .max(2000, { message: "Nội dung quá dài (tối đa 2000 ký tự)" }),
  // serviceSlug (hoặc productSlug) để server lookup tên và build subject.
  // Không validate strict ở client - server sẽ check tồn tại trong DB.
  serviceSlug: z.string().min(1).max(120).optional(),
  productSlug: z.string().min(1).max(120).optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

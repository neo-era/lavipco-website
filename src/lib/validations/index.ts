/**
 * Barrel export cho các Zod schema dùng chung & schema theo domain.
 *
 * Quy ước:
 *  - Mỗi domain một file: `contact.ts`, `auth.ts`, `product.ts`, `quotation.ts`…
 *  - File này re-export tất cả để consumer chỉ cần `import { ... } from "@/lib/validations"`.
 *  - Helper schema dùng chung (email, phone, slug…) đặt trực tiếp ở đây.
 */
import { z } from "zod";

import { normalizePhoneVN } from "@/lib/utils";

// ====================================================================
// Helper schema dùng chung
// ====================================================================

/** Email tiêu chuẩn — bắt buộc, hợp lệ, max 255 ký tự. */
export const emailSchema = z
  .string()
  .min(1, { message: "Vui lòng nhập email" })
  .email({ message: "Email không hợp lệ" })
  .max(255);

/**
 * Số điện thoại Việt Nam.
 * - Chuẩn hoá về dạng 0xxxxxxxxx (10 chữ số bắt đầu bằng 0).
 * - Chấp nhận đầu vào có +84, 84, khoảng trắng, dấu chấm, dấu gạch.
 */
export const phoneVNSchema = z
  .string()
  .min(1, { message: "Vui lòng nhập số điện thoại" })
  .transform(normalizePhoneVN)
  .refine((v) => /^0\d{9}$/.test(v), {
    message: "Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 0)",
  });

/**
 * Slug URL: lowercase, chữ-số-dấu-gạch.
 * Validate dùng cho slug nhập tay ở admin (sản phẩm, dự án, blog…).
 */
export const slugSchema = z
  .string()
  .min(1, { message: "Vui lòng nhập slug" })
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang",
  });

/** Mật khẩu — tối thiểu 8 ký tự, có chữ và số (CLAUDE.md §9). */
export const passwordSchema = z
  .string()
  .min(8, { message: "Mật khẩu tối thiểu 8 ký tự" })
  .max(72, { message: "Mật khẩu tối đa 72 ký tự" })
  .regex(/[A-Za-z]/, { message: "Mật khẩu phải có ít nhất 1 chữ cái" })
  .regex(/\d/, { message: "Mật khẩu phải có ít nhất 1 chữ số" });

/** Tên người dùng / khách hàng — bắt buộc, 2-100 ký tự. */
export const fullNameSchema = z
  .string()
  .min(2, { message: "Họ tên tối thiểu 2 ký tự" })
  .max(100, { message: "Họ tên tối đa 100 ký tự" })
  .trim();

// ====================================================================
// Re-export domain schemas (bổ sung khi tạo file mới)
// ====================================================================
// export * from "./contact";
// export * from "./auth";
// export * from "./product";
// export * from "./quotation";

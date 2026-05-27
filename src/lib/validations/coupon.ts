import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .min(2, { message: "Mã giảm giá tối thiểu 2 ký tự" })
  .max(50)
  .transform((s) => s.trim().toUpperCase());

export type CouponCodeInput = z.infer<typeof couponCodeSchema>;

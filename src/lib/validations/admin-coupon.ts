/**
 * Zod schema cho admin coupon CRUD form.
 */
import { z } from "zod";

export const couponTypeEnum = z.enum(["PERCENT", "FIXED"]);
export type CouponTypeValue = z.infer<typeof couponTypeEnum>;

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .min(2, { message: "Mã ≥ 2 ký tự" })
      .max(50)
      .regex(/^[A-Z0-9_-]+$/, {
        message: "Mã chỉ chữ HOA, số, dấu gạch dưới và gạch ngang",
      }),
    description: z.string().max(500).nullable().optional(),
    type: couponTypeEnum,
    value: z
      .number()
      .nonnegative({ message: "Giá trị ≥ 0" })
      .max(99_999_999),
    minOrderValue: z.number().nonnegative().nullable().optional(),
    validFrom: z.string().min(1, { message: "Chọn ngày bắt đầu" }),
    validTo: z.string().min(1, { message: "Chọn ngày kết thúc" }),
    usageLimit: z.number().int().positive().nullable().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => new Date(data.validFrom).getTime() < new Date(data.validTo).getTime(),
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["validTo"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "PERCENT") {
        return data.value > 0 && data.value <= 100;
      }
      return data.value > 0;
    },
    {
      message: "PERCENT phải 1-100, FIXED phải > 0",
      path: ["value"],
    },
  );

export type CouponInput = z.infer<typeof couponInputSchema>;

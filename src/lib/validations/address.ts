import { z } from "zod";

import { fullNameSchema, phoneVNSchema } from "./shared";

export const addressSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneVNSchema,
  provinceCode: z.string().min(1, { message: "Chọn tỉnh/thành" }),
  provinceName: z.string().min(1),
  wardCode: z.string().min(1, { message: "Chọn phường/xã" }),
  wardName: z.string().min(1),
  street: z
    .string()
    .min(5, { message: "Địa chỉ cụ thể tối thiểu 5 ký tự" })
    .max(255),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

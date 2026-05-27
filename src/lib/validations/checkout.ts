/**
 * Zod schema cho form checkout.
 */
import { z } from "zod";

import { emailSchema, fullNameSchema, phoneVNSchema } from "./shared";

export const PAYMENT_METHODS = [
  "COD",
  "VNPAY",
  "MOMO",
  "BANK_TRANSFER",
] as const;
export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number];

export const SHIPPING_METHODS = ["GHN", "GHTK"] as const;
export type ShippingMethodKey = (typeof SHIPPING_METHODS)[number];

const cartItemPayloadSchema = z.object({
  productVariantId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  variantName: z.string().nullable(),
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  // Người nhận
  recipientName: fullNameSchema,
  recipientPhone: phoneVNSchema,
  recipientEmail: emailSchema,

  // Địa chỉ (lưu code + name để dễ hiển thị + tích hợp GHN)
  provinceCode: z.string().min(1, { message: "Chọn tỉnh/thành" }),
  provinceName: z.string().min(1),
  districtCode: z.string().min(1, { message: "Chọn quận/huyện" }),
  districtName: z.string().min(1),
  wardCode: z.string().min(1, { message: "Chọn phường/xã" }),
  wardName: z.string().min(1),
  street: z
    .string()
    .min(5, { message: "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)" })
    .max(255),
  note: z.string().max(1000).optional(),

  // Phương thức
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Chọn phương thức thanh toán" }),
  shippingMethod: z.enum(SHIPPING_METHODS, { message: "Chọn phương thức vận chuyển" }),

  // Mã giảm giá (optional, đã validate trước qua validateCoupon action)
  couponCode: z.string().max(50).optional(),

  // Items snapshot từ client cart (server sẽ re-validate stock + price)
  items: z.array(cartItemPayloadSchema).min(1, { message: "Giỏ hàng trống" }),

  // Đồng ý điều khoản
  termsAccepted: z.literal(true, {
    message: "Vui lòng đồng ý với điều khoản trước khi đặt hàng",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutCartItem = z.infer<typeof cartItemPayloadSchema>;

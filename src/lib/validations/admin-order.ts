/**
 * Zod schema cho các admin action trên Order.
 */
import { z } from "zod";

export const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);
export type OrderStatusValue = z.infer<typeof orderStatusEnum>;

export const paymentStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatusValue = z.infer<typeof paymentStatusEnum>;

export const shippingStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
]);
export type ShippingStatusValue = z.infer<typeof shippingStatusEnum>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  note: z.string().max(500).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: paymentStatusEnum,
  transactionId: z.string().max(80).optional(),
});

export const updateShippingInfoSchema = z.object({
  provider: z
    .string()
    .min(1, { message: "Chọn đơn vị vận chuyển" })
    .max(40),
  trackingCode: z
    .string()
    .min(1, { message: "Nhập mã vận đơn" })
    .max(80),
  shippingStatus: shippingStatusEnum.optional(),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(5, { message: "Lý do huỷ tối thiểu 5 ký tự" })
    .max(500),
});

export const internalNoteSchema = z.object({
  note: z.string().max(2000),
});

export const refundOrderSchema = z.object({
  amount: z
    .number()
    .int({ message: "Số tiền hoàn phải là số nguyên (VND)" })
    .positive({ message: "Số tiền hoàn phải > 0" }),
  reason: z.string().max(500).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UpdateShippingInfoInput = z.infer<typeof updateShippingInfoSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type InternalNoteInput = z.infer<typeof internalNoteSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderSchema>;

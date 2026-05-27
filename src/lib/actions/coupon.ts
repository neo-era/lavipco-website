"use server";

/**
 * validateCoupon Server Action.
 *
 * Kiểm tra:
 *  - Coupon code tồn tại + isActive
 *  - Hiện tại nằm trong [validFrom, validTo]
 *  - subtotal >= minOrderValue (nếu có)
 *  - usedCount < usageLimit (nếu có)
 *
 * Trả về { ok, type, value, discountAmount } khi valid, hoặc { ok: false, error }.
 *
 * Hiện chưa increment usedCount — chỉ tăng khi createOrder thành công.
 */
import { CouponType } from "@prisma/client";

import { db } from "@/lib/db";
import { couponCodeSchema } from "@/lib/validations/coupon";

export type CouponValidation =
  | {
      ok: true;
      code: string;
      type: CouponType;
      value: number;
      /** Số tiền giảm thực tế (VND), đã tính theo subtotal. */
      discountAmount: number;
      description?: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponValidation> {
  const parsed = couponCodeSchema.safeParse(rawCode);
  if (!parsed.success) {
    return { ok: false, error: "Mã giảm giá không hợp lệ" };
  }
  const code = parsed.data;

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Mã giảm giá không tồn tại hoặc đã tắt" };
  }

  const now = new Date();
  if (coupon.validFrom > now) {
    return { ok: false, error: "Mã giảm giá chưa có hiệu lực" };
  }
  if (coupon.validTo < now) {
    return { ok: false, error: "Mã giảm giá đã hết hạn" };
  }

  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return {
      ok: false,
      error: `Đơn hàng tối thiểu ${Number(coupon.minOrderValue).toLocaleString("vi-VN")}₫ để dùng mã này`,
    };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "Mã giảm giá đã hết lượt sử dụng" };
  }

  const value = Number(coupon.value);
  let discountAmount = 0;
  if (coupon.type === CouponType.PERCENT) {
    // value là phần trăm (0-100)
    discountAmount = Math.floor((subtotal * value) / 100);
  } else {
    // FIXED: trừ số tiền cố định, nhưng không vượt subtotal
    discountAmount = Math.min(value, subtotal);
  }

  return {
    ok: true,
    code: coupon.code,
    type: coupon.type,
    value,
    discountAmount,
    description: coupon.description ?? undefined,
  };
}

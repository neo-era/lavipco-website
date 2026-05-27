"use server";

/**
 * createOrder Server Action.
 *
 * Flow:
 *   1. Validate payload Zod
 *   2. Re-validate items với DB (giá, stock tại thời điểm submit)
 *   3. Tính phí shipping (GHN hoặc mock)
 *   4. Validate coupon (nếu có)
 *   5. Prisma transaction:
 *      - Trừ stock từng variant
 *      - Tạo Order + OrderItems
 *      - Tăng coupon.usedCount nếu có
 *   6. Trả { orderId, code, redirectUrl }
 *      - COD/BANK_TRANSFER → /checkout/success?code=<code>
 *      - VNPay/MoMo → URL gateway (TODO Phase 4.3, hiện trả /success placeholder)
 */
import { revalidatePath } from "next/cache";
import { Prisma, PaymentMethod } from "@prisma/client";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import {
  calculateShippingFee,
  estimateOrderWeight,
} from "@/lib/shipping";
import { validateCoupon } from "./coupon";
import { generateOrderCode } from "@/lib/utils";

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      code: string;
      redirectUrl: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string[]>>;
    };

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  // 1. Validate input
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ, kiểm tra lại các trường.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // 2. Lookup user (nếu logged in)
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // 3. Re-validate items với DB
  const variantIds = data.items.map((i) => i.productVariantId);
  const dbVariants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { select: { id: true, name: true, slug: true, status: true } },
    },
  });

  if (dbVariants.length !== data.items.length) {
    return { ok: false, error: "Một số sản phẩm trong giỏ không còn tồn tại." };
  }

  const stockProblems: string[] = [];
  let computedSubtotal = 0;
  for (const item of data.items) {
    const variant = dbVariants.find((v) => v.id === item.productVariantId);
    if (!variant || variant.product.status !== "ACTIVE") {
      return {
        ok: false,
        error: `Sản phẩm "${item.productName}" không khả dụng.`,
      };
    }
    if (variant.stock < item.quantity) {
      stockProblems.push(
        `${variant.product.name}${variant.name ? ` (${variant.name})` : ""}: còn ${variant.stock}`,
      );
    }
    computedSubtotal += Number(variant.price) * item.quantity;
  }

  if (stockProblems.length > 0) {
    return {
      ok: false,
      error: `Không đủ tồn kho: ${stockProblems.join("; ")}`,
    };
  }

  // 4. Validate coupon (nếu có)
  let discountAmount = 0;
  if (data.couponCode) {
    const result = await validateCoupon(data.couponCode, computedSubtotal);
    if (!result.ok) {
      return { ok: false, error: `Mã giảm giá: ${result.error}` };
    }
    discountAmount = result.discountAmount;
  }

  // 5. Tính phí shipping
  const totalItemCount = data.items.reduce((s, i) => s + i.quantity, 0);
  const shipping = await calculateShippingFee({
    provinceName: data.provinceName,
    districtName: data.districtName,
    wardName: data.wardName,
    weight: estimateOrderWeight(totalItemCount),
    insuranceValue: computedSubtotal,
  });

  const total = computedSubtotal + shipping.fee - discountAmount;

  // 6. Sinh mã đơn hàng dựa trên count đơn hàng cùng ngày
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const todayCount = await db.order.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });
  const orderCode = generateOrderCode(todayCount + 1, now);

  // 7. Prisma transaction
  try {
    const order = await db.$transaction(async (tx) => {
      // Trừ stock atomically với optimistic concurrency
      for (const item of data.items) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(
            `Sản phẩm "${item.productName}" đã hết hàng (có người khác vừa mua).`,
          );
        }
      }

      // Tạo Order
      const created = await tx.order.create({
        data: {
          code: orderCode,
          userId,
          guestEmail: userId ? null : data.recipientEmail,
          guestPhone: userId ? null : data.recipientPhone,
          subtotal: new Prisma.Decimal(computedSubtotal),
          shippingFee: new Prisma.Decimal(shipping.fee),
          discountAmount: new Prisma.Decimal(discountAmount),
          total: new Prisma.Decimal(total),
          shippingSnapshot: {
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            recipientEmail: data.recipientEmail,
            provinceCode: data.provinceCode,
            provinceName: data.provinceName,
            districtCode: data.districtCode,
            districtName: data.districtName,
            wardCode: data.wardCode,
            wardName: data.wardName,
            street: data.street,
            shippingMethod: data.shippingMethod,
            shippingProvider: shipping.provider,
          },
          note: data.note,
          paymentMethod: data.paymentMethod,
          couponCode: data.couponCode || null,
          items: {
            create: data.items.map((item) => {
              const variant = dbVariants.find((v) => v.id === item.productVariantId)!;
              const price = Number(variant.price);
              return {
                productVariantId: item.productVariantId,
                productName: variant.product.name,
                variantName: variant.name,
                sku: variant.sku,
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(price),
                totalPrice: new Prisma.Decimal(price * item.quantity),
              };
            }),
          },
        },
      });

      // Tăng coupon.usedCount nếu có
      if (data.couponCode && discountAmount > 0) {
        await tx.coupon.update({
          where: { code: data.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    revalidatePath("/admin/orders");

    // 8. Build redirect URL theo phương thức thanh toán
    let redirectUrl = `/checkout/success?code=${order.code}`;
    if (data.paymentMethod === PaymentMethod.VNPAY) {
      // TODO Phase 4.3: gọi createVnpayUrl(order) → return payment gateway URL
      redirectUrl = `/checkout/success?code=${order.code}&pending=vnpay`;
    } else if (data.paymentMethod === PaymentMethod.MOMO) {
      // TODO: tích hợp MoMo
      redirectUrl = `/checkout/success?code=${order.code}&pending=momo`;
    }

    return { ok: true, orderId: order.id, code: order.code, redirectUrl };
  } catch (error) {
    console.error("[createOrder] transaction fail", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Không tạo được đơn hàng. Vui lòng thử lại.",
    };
  }
}

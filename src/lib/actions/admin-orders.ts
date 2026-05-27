"use server";

/**
 * Admin order management actions.
 *
 * Tất cả action:
 *  - Require session.user.role === "ADMIN".
 *  - Validate input Zod.
 *  - Log OrderActivity (audit trail).
 *  - Best-effort send email (không block flow nếu fail).
 *  - revalidatePath admin + customer order pages.
 *
 * Notes:
 *  - cancelOrder hoàn stock atomically trong transaction.
 *  - refundOrder gọi VNPay refund API nếu paymentMethod=VNPAY,
 *    fallback marks REFUNDED + log activity nếu COD/BANK_TRANSFER.
 */
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  buildOrderStatusEmail,
  buildShippingUpdateEmail,
  buildOrderCancelledEmail,
  buildOrderRefundedEmail,
  buildPaymentUpdateEmail,
} from "@/lib/email/templates/order-status";
import {
  refundVnpayTransaction,
  VNPAY_ENABLED,
} from "@/lib/payment/vnpay";
import {
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  updateShippingInfoSchema,
  cancelOrderSchema,
  internalNoteSchema,
  refundOrderSchema,
  type UpdateOrderStatusInput,
  type UpdatePaymentStatusInput,
  type UpdateShippingInfoInput,
  type CancelOrderInput,
  type InternalNoteInput,
  type RefundOrderInput,
} from "@/lib/validations/admin-order";
import { PAYMENT_METHOD } from "@/lib/constants";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
  return { userId: session.user.id };
}

/**
 * Lấy thông tin customer để build email context.
 */
function getRecipientInfo(order: {
  guestEmail: string | null;
  user: { name: string | null; email: string | null } | null;
}): { email: string | null; name: string } {
  if (order.user?.email) {
    return { email: order.user.email, name: order.user.name || "Quý khách" };
  }
  if (order.guestEmail) {
    return { email: order.guestEmail, name: "Quý khách" };
  }
  return { email: null, name: "Quý khách" };
}

async function logActivity(args: {
  orderId: string;
  byUserId: string;
  action: string;
  fromValue?: string | null;
  toValue?: string | null;
  note?: string;
}): Promise<void> {
  try {
    await db.orderActivity.create({
      data: {
        orderId: args.orderId,
        byUserId: args.byUserId,
        action: args.action,
        fromValue: args.fromValue ?? null,
        toValue: args.toValue ?? null,
        note: args.note ?? null,
      },
    });
  } catch (error) {
    console.error("[logActivity] fail", error);
  }
}

function revalidateOrderPaths(code: string, id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${code}`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/account/orders`);
  revalidatePath(`/account/orders/${code}`);
  // Cũng touch by id (đề phòng caller dùng id)
  void id;
}

// ======================================================
// UPDATE ORDER STATUS
// ======================================================

export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<ActionResult> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { status, note } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
    if (order.orderStatus === status) {
      return { ok: false, error: `Đơn đã ở trạng thái ${status}` };
    }
    if (order.orderStatus === "CANCELLED") {
      return { ok: false, error: "Đơn đã huỷ, không thể đổi trạng thái" };
    }

    await db.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "STATUS_CHANGE",
      fromValue: order.orderStatus,
      toValue: status,
      note,
    });

    // Best-effort email
    const { email, name } = getRecipientInfo(order);
    if (email) {
      const { subject, html, text } = buildOrderStatusEmail({
        order: {
          code: order.code,
          total: Number(order.total),
          customerName: name,
          recipientEmail: email,
        },
        newStatus: status,
        note,
      });
      await sendEmail({ to: email, subject, html, text });
    }

    revalidateOrderPaths(order.code, order.id);
    return { ok: true };
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật trạng thái",
    };
  }
}

// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================

export async function updatePaymentStatus(
  orderId: string,
  input: UpdatePaymentStatusInput,
): Promise<ActionResult> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = updatePaymentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { status, transactionId } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
    if (order.paymentStatus === status && !transactionId) {
      return { ok: false, error: `Đơn đã ở trạng thái thanh toán ${status}` };
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        ...(transactionId !== undefined
          ? { paymentTransactionId: transactionId }
          : {}),
      },
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "PAYMENT_UPDATE",
      fromValue: order.paymentStatus,
      toValue: status,
      note: transactionId ? `Transaction ID: ${transactionId}` : undefined,
    });

    const { email, name } = getRecipientInfo(order);
    if (email) {
      const { subject, html, text } = buildPaymentUpdateEmail({
        order: {
          code: order.code,
          total: Number(order.total),
          customerName: name,
          recipientEmail: email,
        },
        newStatus: status,
      });
      await sendEmail({ to: email, subject, html, text });
    }

    revalidateOrderPaths(order.code, order.id);
    return { ok: true };
  } catch (error) {
    console.error("[updatePaymentStatus]", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Lỗi cập nhật trạng thái thanh toán",
    };
  }
}

// ======================================================
// UPDATE SHIPPING INFO (tracking + provider)
// ======================================================

export async function updateShippingInfo(
  orderId: string,
  input: UpdateShippingInfoInput,
): Promise<ActionResult> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = updateShippingInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { provider, trackingCode, shippingStatus } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };

    const isFirstShip = !order.trackingCode;

    await db.order.update({
      where: { id: orderId },
      data: {
        shippingProvider: provider,
        trackingCode,
        ...(shippingStatus ? { shippingStatus } : {}),
        // Khi nhập tracking lần đầu, auto đổi shippingStatus → SHIPPED nếu chưa override
        ...(isFirstShip && !shippingStatus
          ? { shippingStatus: "SHIPPED" as const }
          : {}),
      },
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "SHIPPING_UPDATE",
      fromValue: order.trackingCode ?? "",
      toValue: `${provider}:${trackingCode}`,
    });

    // Email chỉ gửi khi lần đầu nhập tracking
    if (isFirstShip) {
      const { email, name } = getRecipientInfo(order);
      if (email) {
        const { subject, html, text } = buildShippingUpdateEmail({
          order: {
            code: order.code,
            total: Number(order.total),
            customerName: name,
            recipientEmail: email,
          },
          provider,
          trackingCode,
        });
        await sendEmail({ to: email, subject, html, text });
      }
    }

    revalidateOrderPaths(order.code, order.id);
    return { ok: true };
  } catch (error) {
    console.error("[updateShippingInfo]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật vận chuyển",
    };
  }
}

// ======================================================
// CANCEL ORDER (refund stock + log + email)
// ======================================================

export async function cancelOrder(
  orderId: string,
  input: CancelOrderInput,
): Promise<ActionResult> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = cancelOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { reason } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { productVariantId: true, quantity: true } },
      },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
    if (order.orderStatus === "CANCELLED") {
      return { ok: false, error: "Đơn đã được huỷ trước đó" };
    }
    if (order.orderStatus === "COMPLETED") {
      return {
        ok: false,
        error: "Đơn đã hoàn tất, không thể huỷ. Liên hệ khách để hoàn trả thủ công.",
      };
    }

    await db.$transaction(async (tx) => {
      // Hoàn stock cho từng item
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          cancelReason: reason,
          cancelledAt: new Date(),
        },
      });
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "CANCELLED",
      fromValue: order.orderStatus,
      toValue: "CANCELLED",
      note: reason,
    });

    const { email, name } = getRecipientInfo(order);
    if (email) {
      const { subject, html, text } = buildOrderCancelledEmail({
        order: {
          code: order.code,
          total: Number(order.total),
          customerName: name,
          recipientEmail: email,
        },
        reason,
      });
      await sendEmail({ to: email, subject, html, text });
    }

    revalidateOrderPaths(order.code, order.id);
    return { ok: true };
  } catch (error) {
    console.error("[cancelOrder]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi huỷ đơn",
    };
  }
}

// ======================================================
// REFUND ORDER (VNPay API nếu thanh toán VNPAY)
// ======================================================

export async function refundOrder(
  orderId: string,
  input: RefundOrderInput,
): Promise<ActionResult<{ method: string; amount: number }>> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = refundOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { amount, reason } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
    if (order.paymentStatus === "REFUNDED") {
      return { ok: false, error: "Đơn đã được hoàn tiền trước đó" };
    }
    if (order.paymentStatus !== "PAID") {
      return {
        ok: false,
        error: "Chỉ có thể hoàn tiền cho đơn đã thanh toán (PAID)",
      };
    }
    if (amount > Number(order.total)) {
      return {
        ok: false,
        error: `Số tiền hoàn (${amount}) > tổng đơn (${order.total})`,
      };
    }

    const methodLabel = PAYMENT_METHOD[order.paymentMethod].label;
    let refundTransactionNo: string | null = null;

    // Nếu VNPay → gọi refund API
    if (order.paymentMethod === "VNPAY") {
      if (!VNPAY_ENABLED) {
        return {
          ok: false,
          error: "VNPay chưa cấu hình env, không thể gọi refund API",
        };
      }
      if (!order.paymentTransactionId) {
        return {
          ok: false,
          error:
            "Đơn VNPay thiếu mã giao dịch (paymentTransactionId). Hãy cập nhật thủ công trước khi refund.",
        };
      }

      // Lấy IP server
      let ipAddr = "127.0.0.1";
      try {
        const h = await headers();
        ipAddr =
          h.get("x-forwarded-for")?.split(",")[0].trim() ||
          h.get("x-real-ip") ||
          "127.0.0.1";
      } catch {
        // ignore
      }

      // VNPay yêu cầu transactionDate (vnp_PayDate) format yyyyMMddHHmmss
      // Tạm dùng order.updatedAt (lúc PAID) — Lam có thể cần lưu vnp_PayDate thật vào DB sau
      const payDate = order.updatedAt;
      const transactionDate = formatYMDHMS(payDate);

      const result = await refundVnpayTransaction({
        orderId: order.code,
        amount,
        orderInfo: `Refund ${order.code}${reason ? `: ${reason}` : ""}`,
        transactionType: amount === Number(order.total) ? "02" : "03",
        createBy: admin.userId.slice(0, 20),
        transactionDate,
        transactionNo: order.paymentTransactionId,
        ipAddr,
      });

      if (!result.ok) {
        return { ok: false, error: `VNPay refund thất bại: ${result.message}` };
      }
      refundTransactionNo = result.refundTransactionNo;
    }

    // Mark REFUNDED + log + email
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "REFUNDED",
        refundedAt: new Date(),
        refundAmount: new Prisma.Decimal(amount),
      },
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "REFUNDED",
      fromValue: "PAID",
      toValue: `REFUNDED ${amount}`,
      note: reason
        ? `${reason}${refundTransactionNo ? ` | VNPay TxnNo: ${refundTransactionNo}` : ""}`
        : refundTransactionNo
          ? `VNPay TxnNo: ${refundTransactionNo}`
          : undefined,
    });

    const { email, name } = getRecipientInfo(order);
    if (email) {
      const { subject, html, text } = buildOrderRefundedEmail({
        order: {
          code: order.code,
          total: Number(order.total),
          customerName: name,
          recipientEmail: email,
        },
        refundAmount: amount,
        method: methodLabel,
      });
      await sendEmail({ to: email, subject, html, text });
    }

    revalidateOrderPaths(order.code, order.id);
    return { ok: true, data: { method: methodLabel, amount } };
  } catch (error) {
    console.error("[refundOrder]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi hoàn tiền",
    };
  }
}

// ======================================================
// ADD INTERNAL NOTE
// ======================================================

export async function addInternalNote(
  orderId: string,
  input: InternalNoteInput,
): Promise<ActionResult> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = internalNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { note } = parsed.data;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { code: true, internalNote: true },
    });
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };

    await db.order.update({
      where: { id: orderId },
      data: { internalNote: note || null },
    });

    await logActivity({
      orderId,
      byUserId: admin.userId,
      action: "NOTE_ADDED",
      fromValue: order.internalNote ?? null,
      toValue: note,
    });

    revalidateOrderPaths(order.code, orderId);
    return { ok: true };
  } catch (error) {
    console.error("[addInternalNote]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi lưu ghi chú",
    };
  }
}

/**
 * Format Date → yyyyMMddHHmmss theo UTC+7 (cho VNPay refund).
 */
function formatYMDHMS(date: Date): string {
  const tzOffset = 7 * 60;
  const local = new Date(
    date.getTime() + (tzOffset + date.getTimezoneOffset()) * 60_000,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    local.getFullYear() +
    pad(local.getMonth() + 1) +
    pad(local.getDate()) +
    pad(local.getHours()) +
    pad(local.getMinutes()) +
    pad(local.getSeconds())
  );
}

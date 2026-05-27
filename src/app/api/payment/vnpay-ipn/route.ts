/**
 * VNPay IPN (Instant Payment Notification) endpoint.
 *
 * VNPay gọi GET endpoint này với query params sau mỗi giao dịch (server-to-server).
 * Khác với Return URL (browser redirect), IPN là backend channel đảm bảo nhận
 * notification kể cả khi user đóng tab/mất mạng giữa chừng.
 *
 * Spec: response JSON đúng format VNPay yêu cầu, ngược lại VNPay sẽ retry.
 *   - 00: Confirm Success
 *   - 01: Order not found
 *   - 02: Order already confirmed
 *   - 04: Invalid amount
 *   - 97: Invalid Checksum
 *   - 99: Unknown error
 *
 * Endpoint phải idempotent: VNPay có thể gọi nhiều lần.
 */
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyIpn } from "@/lib/payment/vnpay";

type IpnResponse = { RspCode: string; Message: string };

function reply(code: string, message: string): NextResponse<IpnResponse> {
  return NextResponse.json({ RspCode: code, Message: message });
}

export async function GET(request: Request): Promise<NextResponse<IpnResponse>> {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // 1. Verify chữ ký
  const verified = verifyIpn(query);
  if (!verified.isValid) {
    console.warn("[vnpay-ipn] Invalid checksum", query);
    return reply("97", "Invalid Checksum");
  }

  const orderCode = verified.orderId;
  if (!orderCode) {
    return reply("01", "Order not found");
  }

  // 2. Lookup order
  const order = await db.order.findUnique({ where: { code: orderCode } });
  if (!order) {
    return reply("01", "Order not found");
  }

  // 3. Validate amount khớp
  if (verified.amount !== null && verified.amount !== Math.round(Number(order.total))) {
    console.warn(
      "[vnpay-ipn] Amount mismatch",
      "expected",
      Number(order.total),
      "received",
      verified.amount,
    );
    return reply("04", "Invalid amount");
  }

  // 4. Idempotent: nếu đã PAID/FAILED thì không update lại
  if (order.paymentStatus !== "PENDING") {
    return reply("02", "Order already confirmed");
  }

  // 5. Update DB theo response code
  try {
    if (verified.isSuccess) {
      await db.order.update({
        where: { code: orderCode },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
        },
      });
      console.log("[vnpay-ipn] Order PAID", orderCode, verified.transactionNo);
    } else {
      await db.order.update({
        where: { code: orderCode },
        data: { paymentStatus: "FAILED" },
      });
      console.log(
        "[vnpay-ipn] Order FAILED",
        orderCode,
        "code",
        verified.responseCode,
      );
    }
    return reply("00", "Confirm Success");
  } catch (error) {
    console.error("[vnpay-ipn] DB update error", error);
    return reply("99", "Unknown error");
  }
}

// Một số tài liệu VNPay đề cập POST → expose cả 2 cho safe
export const POST = GET;

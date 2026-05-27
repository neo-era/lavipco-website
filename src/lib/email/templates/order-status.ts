/**
 * Email templates cho cập nhật đơn hàng.
 *
 * Mỗi function trả {subject, html, text} — HTML inline style cho compatibility
 * email client. Không dùng React component / MDX.
 */
import { SITE_CONFIG, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

type OrderEmailContext = {
  code: string;
  total: number;
  customerName: string;
  recipientEmail: string;
};

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseLayout(args: { title: string; bodyHtml: string }): string {
  const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account/orders`;
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${htmlEscape(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background:#0B5FA5;padding:20px 24px;color:#fff;">
              <h1 style="margin:0;font-size:18px;font-weight:700;">${htmlEscape(SITE_CONFIG.name)}</h1>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${htmlEscape(SITE_CONFIG.tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              ${args.bodyHtml}
              <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
              <p style="margin:0;font-size:13px;color:#6b7280;">
                Xem chi tiết đơn hàng: <a href="${orderUrl}" style="color:#0B5FA5;text-decoration:none;">${orderUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#6b7280;text-align:center;">
              <p style="margin:0;">© ${new Date().getFullYear()} ${htmlEscape(SITE_CONFIG.fullName)}</p>
              ${SITE_CONFIG.hotline ? `<p style="margin:4px 0 0;">Hotline: ${htmlEscape(SITE_CONFIG.hotline)}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Email khi đổi trạng thái đơn (PENDING → CONFIRMED → PROCESSING → COMPLETED).
 */
export function buildOrderStatusEmail(args: {
  order: OrderEmailContext;
  newStatus: OrderStatus;
  note?: string;
}): { subject: string; html: string; text: string } {
  const statusLabel = ORDER_STATUS[args.newStatus].label;
  const subject = `[${SITE_CONFIG.name}] Đơn ${args.order.code} - ${statusLabel}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.order.customerName)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Đơn hàng <strong>${htmlEscape(args.order.code)}</strong> của bạn đã được cập nhật sang trạng thái:
    </p>
    <div style="background:#eff6ff;border-left:4px solid #0B5FA5;padding:12px 16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;font-size:16px;font-weight:600;color:#0B5FA5;">${htmlEscape(statusLabel)}</p>
    </div>
    <p style="margin:0 0 8px;font-size:14px;">Tổng giá trị: <strong>${formatCurrency(args.order.total)}</strong></p>
    ${args.note ? `<p style="margin:8px 0 0;padding:10px 14px;background:#f9fafb;border-radius:6px;font-size:13px;color:#4b5563;"><strong>Ghi chú từ ${htmlEscape(SITE_CONFIG.name)}:</strong> ${htmlEscape(args.note)}</p>` : ""}
  `;

  const text = `Xin chào ${args.order.customerName},

Đơn hàng ${args.order.code} đã được cập nhật sang trạng thái: ${statusLabel}.
Tổng: ${formatCurrency(args.order.total)}
${args.note ? `\nGhi chú: ${args.note}\n` : ""}
Xem chi tiết tại ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account/orders/${args.order.code}`;

  return { subject, html: baseLayout({ title: subject, bodyHtml }), text };
}

/**
 * Email khi cập nhật thông tin vận chuyển (mã vận đơn).
 */
export function buildShippingUpdateEmail(args: {
  order: OrderEmailContext;
  provider: string;
  trackingCode: string;
}): { subject: string; html: string; text: string } {
  const subject = `[${SITE_CONFIG.name}] Đơn ${args.order.code} - Đã gửi vận chuyển`;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.order.customerName)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Đơn hàng <strong>${htmlEscape(args.order.code)}</strong> đã được giao cho đơn vị vận chuyển:
    </p>
    <table role="presentation" cellpadding="8" style="background:#f9fafb;border-radius:8px;font-size:14px;width:100%;margin:12px 0;">
      <tr><td style="font-weight:600;width:140px;">Đơn vị vận chuyển:</td><td>${htmlEscape(args.provider)}</td></tr>
      <tr><td style="font-weight:600;">Mã vận đơn:</td><td><strong style="font-family:monospace;color:#0B5FA5;">${htmlEscape(args.trackingCode)}</strong></td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Bạn có thể tra cứu trạng thái giao hàng trên website ${htmlEscape(args.provider)} bằng mã vận đơn ở trên.
    </p>
  `;
  const text = `Đơn hàng ${args.order.code} đã được giao cho ${args.provider}.
Mã vận đơn: ${args.trackingCode}`;
  return { subject, html: baseLayout({ title: subject, bodyHtml }), text };
}

/**
 * Email khi huỷ đơn.
 */
export function buildOrderCancelledEmail(args: {
  order: OrderEmailContext;
  reason: string;
}): { subject: string; html: string; text: string } {
  const subject = `[${SITE_CONFIG.name}] Đơn ${args.order.code} đã huỷ`;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.order.customerName)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Đơn hàng <strong>${htmlEscape(args.order.code)}</strong> đã bị huỷ.
    </p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#991b1b;">Lý do:</p>
      <p style="margin:4px 0 0;font-size:14px;color:#7f1d1d;">${htmlEscape(args.reason)}</p>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Nếu bạn cần hỗ trợ, vui lòng liên hệ hotline ${htmlEscape(SITE_CONFIG.hotline || "(số hotline)")} hoặc email ${htmlEscape(SITE_CONFIG.email || "support@lavipco.com.vn")}.
    </p>
  `;
  const text = `Đơn hàng ${args.order.code} đã bị huỷ.
Lý do: ${args.reason}`;
  return { subject, html: baseLayout({ title: subject, bodyHtml }), text };
}

/**
 * Email khi hoàn tiền.
 */
export function buildOrderRefundedEmail(args: {
  order: OrderEmailContext;
  refundAmount: number;
  method: string;
}): { subject: string; html: string; text: string } {
  const subject = `[${SITE_CONFIG.name}] Đã hoàn tiền đơn ${args.order.code}`;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.order.customerName)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Chúng tôi đã xử lý hoàn tiền cho đơn hàng <strong>${htmlEscape(args.order.code)}</strong>.
    </p>
    <table role="presentation" cellpadding="8" style="background:#f0fdf4;border-radius:8px;font-size:14px;width:100%;margin:12px 0;border-left:4px solid #16a34a;">
      <tr><td style="font-weight:600;width:140px;">Số tiền hoàn:</td><td style="font-weight:700;color:#15803d;">${formatCurrency(args.refundAmount)}</td></tr>
      <tr><td style="font-weight:600;">Phương thức:</td><td>${htmlEscape(args.method)}</td></tr>
      <tr><td style="font-weight:600;">Thời gian:</td><td>${formatDateTime(new Date())}</td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
      Tiền sẽ về tài khoản của bạn trong 1–7 ngày làm việc tuỳ ngân hàng/ví điện tử.
    </p>
  `;
  const text = `Đã hoàn tiền ${formatCurrency(args.refundAmount)} cho đơn ${args.order.code} qua ${args.method}.`;
  return { subject, html: baseLayout({ title: subject, bodyHtml }), text };
}

/**
 * Email khi cập nhật trạng thái thanh toán (PAID/FAILED).
 */
export function buildPaymentUpdateEmail(args: {
  order: OrderEmailContext;
  newStatus: PaymentStatus;
}): { subject: string; html: string; text: string } {
  const statusLabel = PAYMENT_STATUS[args.newStatus].label;
  const subject = `[${SITE_CONFIG.name}] Đơn ${args.order.code} - Thanh toán: ${statusLabel}`;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.order.customerName)},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Trạng thái thanh toán đơn <strong>${htmlEscape(args.order.code)}</strong> đã được cập nhật:
    </p>
    <div style="background:#eff6ff;border-left:4px solid #0B5FA5;padding:12px 16px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;font-size:16px;font-weight:600;color:#0B5FA5;">${htmlEscape(statusLabel)}</p>
    </div>
  `;
  const text = `Trạng thái thanh toán đơn ${args.order.code}: ${statusLabel}`;
  return { subject, html: baseLayout({ title: subject, bodyHtml }), text };
}

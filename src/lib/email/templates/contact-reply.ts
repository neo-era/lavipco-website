/**
 * Email template trả lời tin nhắn liên hệ.
 */
import { SITE_CONFIG } from "@/lib/constants";

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildContactReplyEmail(args: {
  customerName: string;
  originalMessage: string;
  originalSubject: string | null;
  replyBody: string;
}): { subject: string; html: string; text: string } {
  const subject = args.originalSubject
    ? `Re: ${args.originalSubject}`
    : `[${SITE_CONFIG.name}] Phản hồi liên hệ của bạn`;

  // Convert plain text reply → HTML (nl2br + escape)
  const replyHtml = htmlEscape(args.replyBody).replace(/\n/g, "<br />");
  const originalHtml = htmlEscape(args.originalMessage).replace(/\n/g, "<br />");

  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${htmlEscape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;max-width:600px;">
        <tr><td style="background:#0B5FA5;padding:20px 24px;color:#fff;">
          <h1 style="margin:0;font-size:18px;font-weight:700;">${htmlEscape(SITE_CONFIG.name)}</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Phản hồi liên hệ</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:14px;">Xin chào ${htmlEscape(args.customerName)},</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Cảm ơn bạn đã liên hệ. Dưới đây là phản hồi từ ${htmlEscape(SITE_CONFIG.name)}:</p>

          <div style="background:#f9fafb;border-left:4px solid #0B5FA5;padding:14px 18px;border-radius:6px;margin:16px 0;font-size:14px;line-height:1.7;">
            ${replyHtml}
          </div>

          <details style="margin-top:24px;font-size:13px;color:#6b7280;">
            <summary style="cursor:pointer;font-weight:600;">Nội dung gốc bạn đã gửi</summary>
            <div style="background:#f3f4f6;padding:12px;border-radius:6px;margin-top:8px;line-height:1.6;">
              ${originalHtml}
            </div>
          </details>

          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Nếu cần hỗ trợ thêm, vui lòng trả lời email này hoặc gọi hotline ${htmlEscape(SITE_CONFIG.hotline || "(hotline)")}.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#6b7280;text-align:center;">
          <p style="margin:0;">© ${new Date().getFullYear()} ${htmlEscape(SITE_CONFIG.fullName)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Xin chào ${args.customerName},

Cảm ơn bạn đã liên hệ ${SITE_CONFIG.name}. Phản hồi:

${args.replyBody}

---
Nội dung gốc bạn đã gửi:
${args.originalMessage}

—
${SITE_CONFIG.fullName}
${SITE_CONFIG.hotline ? `Hotline: ${SITE_CONFIG.hotline}` : ""}`;

  return { subject, html, text };
}

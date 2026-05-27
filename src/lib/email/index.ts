/**
 * Email helper - defensive Resend.
 *
 * Env cần có:
 *   - RESEND_API_KEY
 *   - EMAIL_FROM
 *
 * Khi env đầy đủ → gửi qua Resend API → return ok.
 * Khi env thiếu → log nội dung email ra console (dev) và return ok=false.
 *
 * Caller (server action) phải coi việc gửi email là best-effort, không block
 * core flow nếu fail.
 */
import { Resend } from "resend";

export const EMAIL_ENABLED = Boolean(
  process.env.RESEND_API_KEY && process.env.EMAIL_FROM,
);

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  if (!EMAIL_ENABLED) return null;
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain text fallback (optional). */
  text?: string;
  /** Reply-to override. Default = EMAIL_FROM. */
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Gửi email qua Resend. Best-effort: log + return error thay vì throw.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const client = getClient();
  if (!client) {
    console.warn(
      "[email] RESEND_API_KEY/EMAIL_FROM thiếu — skip gửi. Subject:",
      input.subject,
      "To:",
      input.to,
    );
    return { ok: false, error: "Email service chưa cấu hình" };
  }

  try {
    const res = await client.emails.send({
      from: process.env.EMAIL_FROM!,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (res.error) {
      console.error("[email] Resend error:", res.error);
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id ?? "" };
  } catch (error) {
    console.error("[email] Exception:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Email gửi thất bại",
    };
  }
}

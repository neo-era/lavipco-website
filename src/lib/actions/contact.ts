"use server";

/**
 * Server Action xử lý form Liên hệ.
 * - Validate Zod
 * - Rate limit 3 lần/giờ/IP qua lib/rate-limit (Upstash defensive)
 * - Lưu vào bảng ContactMessage
 * - Email gửi admin: placeholder (TODO Resend)
 */
import { db } from "@/lib/db";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { SITE_CONFIG } from "@/lib/constants";
import {
  checkRateLimit,
  contactLimiter,
  getClientIp,
} from "@/lib/rate-limit";

export type ContactFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof ContactInput, string[]>>;
};

export async function submitContact(input: ContactInput): Promise<ContactFormState> {
  // Validate
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Rate limit theo IP
  const rl = await checkRateLimit(contactLimiter, "submit");
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }
  const ip = await getClientIp();

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        ipAddress: ip === "unknown" ? null : ip,
      },
    });
  } catch (error) {
    console.error("[submitContact] Lỗi khi lưu ContactMessage", error);
    return {
      ok: false,
      error: "Không gửi được liên hệ. Vui lòng thử lại sau ít phút.",
    };
  }

  // TODO: tích hợp Resend ở src/lib/email/ - gửi email cho admin
  console.log("[email] TODO gửi báo cho admin về liên hệ mới", {
    to: SITE_CONFIG.email || "admin@lavipco.com.vn",
    subject: `[Liên hệ] ${subject} - ${name}`,
    from: { name, email, phone },
  });

  return { ok: true };
}

"use server";

/**
 * Server Action xử lý form Liên hệ.
 * - Validate Zod
 * - Rate limit 3 lần/giờ/IP (in-memory, đủ cho dev/single instance)
 * - Lưu vào bảng ContactMessage
 * - Email gửi admin: placeholder (TODO Resend)
 *
 * Cảnh báo production: rate limit in-memory KHÔNG hoạt động đúng khi
 * deploy multi-server hoặc serverless function instances. Khi chuyển
 * sang Vercel/PM2 multi-instance, thay bằng Redis (upstash/ratelimit).
 */
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { SITE_CONFIG } from "@/lib/constants";

export type ContactFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof ContactInput, string[]>>;
};

const RATE_LIMIT = {
  maxPerWindow: 3,
  windowMs: 60 * 60 * 1000, // 1 giờ
};

// Map IP → { count trong cửa sổ hiện tại, thời điểm reset }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Hết cửa sổ → reset
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, resetAt: now + RATE_LIMIT.windowMs };
  }

  // Vẫn trong cửa sổ
  if (entry.count >= RATE_LIMIT.maxPerWindow) {
    return { allowed: false, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, resetAt: entry.resetAt };
}

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      "unknown";
    return ip;
  } catch {
    return "unknown";
  }
}

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
  const ip = await getClientIp();
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    console.warn("[contact] Rate limit vượt ngưỡng cho IP", ip);
    const minutesLeft = Math.ceil((rl.resetAt - Date.now()) / 60000);
    return {
      ok: false,
      error: `Bạn đã gửi quá ${RATE_LIMIT.maxPerWindow} yêu cầu trong 1 giờ. Vui lòng thử lại sau ${minutesLeft} phút.`,
    };
  }

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

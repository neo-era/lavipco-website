"use server";

/**
 * Server Actions xử lý yêu cầu báo giá từ trang chi tiết dịch vụ/sản phẩm.
 *
 * 2 entry point chia sẻ chung `processQuote(input)`:
 *  - `requestQuote(prev, formData)` — cho useFormState (form HTML cổ điển)
 *  - `submitQuote(input)` — cho RHF/JSON (form modern, Dialog popup)
 *
 * Email gửi admin: hiện console.log placeholder, sẽ tích hợp Resend
 * ở src/lib/email/ trong Phase tiếp theo.
 */
import { headers } from "next/headers";

import { db } from "@/lib/db";
import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/lib/validations/quote";
import { SITE_CONFIG } from "@/lib/constants";
import { contactLimiter, checkRateLimit } from "@/lib/rate-limit";

export type QuoteFormState = {
  ok?: boolean;
  /** Nonce thay đổi mỗi submit thành công - để client useEffect detect và reset form */
  submittedAt?: number;
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

async function processQuote(input: QuoteRequestInput): Promise<QuoteFormState> {
  // Rate limit 3/giờ/IP (cùng quota contact - cùng dạng abuse)
  const rl = await checkRateLimit(contactLimiter, "quote");
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }

  const { name, email, phone, message, serviceSlug, productSlug } = input;

  // Build subject từ slug
  let subjectPrefix = "Yêu cầu báo giá";
  if (serviceSlug) {
    const service = await db.service.findUnique({
      where: { slug: serviceSlug },
      select: { title: true },
    });
    if (service) subjectPrefix = `Báo giá: ${service.title}`;
  } else if (productSlug) {
    const product = await db.product.findUnique({
      where: { slug: productSlug },
      select: { name: true },
    });
    if (product) subjectPrefix = `Báo giá: ${product.name}`;
  }

  // Lấy IP (best-effort)
  let ipAddress: string | null = null;
  try {
    const h = await headers();
    ipAddress =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      null;
  } catch {
    // ignore
  }

  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject: subjectPrefix,
        message,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("[processQuote] Lỗi lưu ContactMessage", error);
    return {
      ok: false,
      error: "Không gửi được yêu cầu, vui lòng thử lại sau ít phút.",
    };
  }

  // TODO: gửi email cho admin qua Resend (src/lib/email/)
  console.log("[email] TODO gửi báo cho admin về yêu cầu báo giá", {
    to: SITE_CONFIG.email || "admin@lavipco.com.vn",
    subject: subjectPrefix,
    from: { name, email, phone },
  });

  return { ok: true, submittedAt: Date.now() };
}

/**
 * Entry point cho form HTML cổ điển (useFormState ở trang chi tiết Dịch vụ).
 */
export async function requestQuote(
  _prev: QuoteFormState | undefined,
  formData: FormData,
): Promise<QuoteFormState> {
  const parsed = quoteRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    serviceSlug: formData.get("serviceSlug") || undefined,
    productSlug: formData.get("productSlug") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return processQuote(parsed.data);
}

/**
 * Entry point cho RHF / fetch JSON.
 * Server re-validate để chống tamper kể cả khi client đã validate.
 */
export async function submitQuote(input: QuoteRequestInput): Promise<QuoteFormState> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return processQuote(parsed.data);
}

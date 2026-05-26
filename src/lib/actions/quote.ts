"use server";

/**
 * Server Action xử lý yêu cầu báo giá từ trang chi tiết dịch vụ/sản phẩm.
 * Lưu vào bảng ContactMessage để admin xử lý ở /admin/orders/quotes.
 *
 * Email thông báo cho admin: hiện chỉ console.log, sẽ tích hợp Resend
 * ở src/lib/email/ trong Phase tiếp theo.
 */
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { quoteRequestSchema } from "@/lib/validations/quote";
import { SITE_CONFIG } from "@/lib/constants";

export type QuoteFormState = {
  ok?: boolean;
  /** Nonce thay đổi mỗi submit thành công - để client useEffect detect và reset form */
  submittedAt?: number;
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function requestQuote(
  _prev: QuoteFormState | undefined,
  formData: FormData,
): Promise<QuoteFormState> {
  // Parse + validate
  const parsed = quoteRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    serviceSlug: formData.get("serviceSlug") || undefined,
    productSlug: formData.get("productSlug") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, message, serviceSlug, productSlug } = parsed.data;

  // Build subject từ slug đã pass
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

  // Lấy IP để log/chống spam cơ bản (best-effort, không bắt buộc)
  let ipAddress: string | null = null;
  try {
    const h = await headers();
    ipAddress =
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      null;
  } catch {
    // Bỏ qua nếu không lấy được
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
    console.error("[requestQuote] Lỗi khi lưu ContactMessage", error);
    return {
      ok: false,
      error: "Không gửi được yêu cầu, vui lòng thử lại sau ít phút.",
    };
  }

  // TODO: tích hợp Resend ở src/lib/email/ - gửi email cho admin
  // Khi có: await sendQuoteNotification({ to: SITE_CONFIG.email, ... })
  console.log("[email] TODO gửi báo cho admin về yêu cầu báo giá", {
    to: SITE_CONFIG.email || "admin@lavipco.com.vn",
    subject: subjectPrefix,
    from: { name, email, phone },
  });

  return { ok: true, submittedAt: Date.now() };
}

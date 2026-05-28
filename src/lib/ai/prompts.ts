/**
 * Prompt templates cho Admin Copilot.
 *
 * Mỗi content type có: system prompt (vai trò + ràng buộc format) + builder
 * tạo user prompt từ context. Output luôn là plain text (markdown cho mô tả,
 * HTML cho blog content) — admin review trước khi lưu.
 *
 * Nguyên tắc chống hallucination:
 *  - Chỉ dùng thông tin admin cung cấp trong context, KHÔNG bịa thông số.
 *  - Nếu thiếu data → viết chung chung, không bịa số liệu kỹ thuật.
 */

export type AIContentType =
  | "product-description"
  | "product-short"
  | "product-seo"
  | "blog-content"
  | "blog-excerpt"
  | "blog-seo"
  | "service-description"
  | "service-short"
  | "project-summary"
  | "project-description";

const BRAND_CONTEXT = `Bạn đang viết nội dung cho website LAVIPCO (Công ty TNHH Kỹ Nghệ Lâm Việt Phát) — chuyên đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, chiếu sáng cảnh quan, hạ tầng điện và Smart City tại Việt Nam. Khách hàng gồm B2C (mua lẻ) và B2B (chủ đầu tư, nhà thầu, ban quản lý đô thị).`;

const ANTI_HALLUCINATION = `QUAN TRỌNG: Chỉ sử dụng thông tin được cung cấp. TUYỆT ĐỐI KHÔNG bịa ra thông số kỹ thuật (công suất, điện áp, IP, lumen, nhiệt độ màu...) nếu không có trong dữ liệu. Nếu thiếu thông tin, viết chung chung về lợi ích thay vì bịa số liệu. Viết bằng tiếng Việt tự nhiên, chuyên nghiệp.`;

type PromptResult = {
  system: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
};

export type ProductContext = {
  name?: string;
  brand?: string | null;
  categoryName?: string;
  specs?: Array<{ key: string; value: string; unit?: string }>;
  shortDescription?: string | null;
  basePrice?: number;
  priceOnRequest?: boolean;
  existingDescription?: string | null;
};

export type BlogContext = {
  title?: string;
  excerpt?: string | null;
  tags?: string[];
  existingContent?: string | null;
  outline?: string;
};

export type ServiceContext = {
  title?: string;
  shortDescription?: string | null;
  existingDescription?: string | null;
};

export type ProjectContext = {
  title?: string;
  client?: string | null;
  location?: string | null;
  year?: number | null;
  categoryLabel?: string;
  scale?: string | null;
  existingSummary?: string | null;
};

export type AIGenerateContext =
  | { type: "product-description" | "product-short" | "product-seo"; data: ProductContext }
  | { type: "blog-content" | "blog-excerpt" | "blog-seo"; data: BlogContext }
  | { type: "service-description" | "service-short"; data: ServiceContext }
  | { type: "project-summary" | "project-description"; data: ProjectContext };

function formatProductFacts(data: ProductContext): string {
  const lines: string[] = [];
  if (data.name) lines.push(`- Tên sản phẩm: ${data.name}`);
  if (data.brand) lines.push(`- Thương hiệu: ${data.brand}`);
  if (data.categoryName) lines.push(`- Danh mục: ${data.categoryName}`);
  if (data.specs && data.specs.length > 0) {
    lines.push("- Thông số kỹ thuật:");
    for (const s of data.specs) {
      lines.push(`  + ${s.key}: ${s.value}${s.unit ? " " + s.unit : ""}`);
    }
  }
  if (data.shortDescription) lines.push(`- Mô tả ngắn hiện có: ${data.shortDescription}`);
  if (data.basePrice && !data.priceOnRequest) {
    lines.push(`- Giá: ${data.basePrice.toLocaleString("vi-VN")} ₫`);
  }
  if (data.priceOnRequest) lines.push("- Giá: liên hệ báo giá (sản phẩm dự án)");
  return lines.length > 0 ? lines.join("\n") : "(chưa có thông tin)";
}

export function buildPrompt(ctx: AIGenerateContext): PromptResult {
  switch (ctx.type) {
    case "product-description":
      return {
        system: `${BRAND_CONTEXT}\n\nBạn là chuyên gia content marketing cho thiết bị chiếu sáng kỹ thuật. ${ANTI_HALLUCINATION}\n\nViết mô tả chi tiết sản phẩm bằng Markdown. Cấu trúc gợi ý: đoạn mở đầu giới thiệu, danh sách ưu điểm nổi bật (bullet), ứng dụng thực tế. Độ dài 150-300 từ. KHÔNG dùng heading H1. Có thể dùng **bold**, danh sách. KHÔNG lặp lại bảng thông số (đã có riêng).`,
        prompt: `Viết mô tả chi tiết cho sản phẩm sau:\n\n${formatProductFacts(ctx.data)}`,
        maxTokens: 1200,
        temperature: 0.7,
      };

    case "product-short":
      return {
        system: `${BRAND_CONTEXT}\n\n${ANTI_HALLUCINATION}\n\nViết MÔ TẢ NGẮN cho sản phẩm: 1-2 câu súc tích, nêu bật giá trị cốt lõi, dùng hiển thị ở card sản phẩm. Tối đa 150 ký tự. Chỉ trả về text mô tả, không thêm lời dẫn.`,
        prompt: `Viết mô tả ngắn cho sản phẩm:\n\n${formatProductFacts(ctx.data)}`,
        maxTokens: 200,
        temperature: 0.6,
      };

    case "product-seo":
      return {
        system: `${BRAND_CONTEXT}\n\nBạn là chuyên gia SEO. ${ANTI_HALLUCINATION}\n\nViết META DESCRIPTION cho trang sản phẩm: tối ưu SEO, chứa từ khoá chính, hấp dẫn click, 150-160 ký tự. Chỉ trả về text meta description, không thêm lời dẫn hay dấu ngoặc kép.`,
        prompt: `Viết meta description SEO cho sản phẩm:\n\n${formatProductFacts(ctx.data)}`,
        maxTokens: 200,
        temperature: 0.6,
      };

    case "blog-content":
      return {
        system: `${BRAND_CONTEXT}\n\nBạn là cây viết chuyên ngành chiếu sáng đô thị và giao thông. ${ANTI_HALLUCINATION}\n\nViết bài blog hoàn chỉnh bằng HTML (dùng được trong rich text editor). Dùng các tag: <h2>, <h3>, <p>, <ul>/<li>, <strong>, <em>, <blockquote>. KHÔNG dùng <h1> (tiêu đề bài đã có riêng). Độ dài 400-700 từ. Văn phong chuyên nghiệp, hữu ích, có chiều sâu kỹ thuật nhưng dễ đọc.`,
        prompt: blogContentPrompt(ctx.data),
        maxTokens: 2500,
        temperature: 0.75,
      };

    case "blog-excerpt":
      return {
        system: `${BRAND_CONTEXT}\n\n${ANTI_HALLUCINATION}\n\nViết TÓM TẮT (excerpt) cho bài blog: 1-2 câu hấp dẫn, gợi mở nội dung, dùng ở card + OG description. Tối đa 200 ký tự. Chỉ trả về text, không thêm lời dẫn.`,
        prompt: `Viết tóm tắt cho bài blog có tiêu đề: "${ctx.data.title ?? "(chưa có tiêu đề)"}"${ctx.data.existingContent ? `\n\nNội dung bài:\n${stripTags(ctx.data.existingContent).slice(0, 2000)}` : ""}`,
        maxTokens: 200,
        temperature: 0.6,
      };

    case "blog-seo":
      return {
        system: `${BRAND_CONTEXT}\n\nBạn là chuyên gia SEO. Viết META DESCRIPTION cho bài blog: tối ưu SEO, 150-160 ký tự, hấp dẫn click. Chỉ trả về text, không dấu ngoặc kép.`,
        prompt: `Viết meta description SEO cho bài blog: "${ctx.data.title ?? ""}"${ctx.data.excerpt ? `\nTóm tắt: ${ctx.data.excerpt}` : ""}`,
        maxTokens: 200,
        temperature: 0.6,
      };

    case "service-description":
      return {
        system: `${BRAND_CONTEXT}\n\n${ANTI_HALLUCINATION}\n\nViết mô tả chi tiết DỊCH VỤ bằng Markdown. Nêu: giá trị dịch vụ, phạm vi thực hiện, lợi ích cho khách hàng B2B. Độ dài 150-300 từ. KHÔNG dùng H1.`,
        prompt: `Viết mô tả chi tiết cho dịch vụ:\n- Tên: ${ctx.data.title ?? "(chưa có)"}${ctx.data.shortDescription ? `\n- Mô tả ngắn: ${ctx.data.shortDescription}` : ""}`,
        maxTokens: 1200,
        temperature: 0.7,
      };

    case "service-short":
      return {
        system: `${BRAND_CONTEXT}\n\n${ANTI_HALLUCINATION}\n\nViết MÔ TẢ NGẮN dịch vụ: 1-2 câu súc tích nêu giá trị. Tối đa 150 ký tự. Chỉ trả về text.`,
        prompt: `Viết mô tả ngắn cho dịch vụ: ${ctx.data.title ?? "(chưa có)"}`,
        maxTokens: 200,
        temperature: 0.6,
      };

    case "project-summary":
      return {
        system: `${BRAND_CONTEXT}\n\n${ANTI_HALLUCINATION}\n\nViết TÓM TẮT dự án: 1-3 câu nêu bật quy mô + giá trị dự án, dùng ở card portfolio. Tối đa 250 ký tự. Chỉ trả về text.`,
        prompt: projectPrompt(ctx.data),
        maxTokens: 250,
        temperature: 0.6,
      };

    case "project-description":
      return {
        system: `${BRAND_CONTEXT}\n\nBạn viết hồ sơ năng lực dự án. ${ANTI_HALLUCINATION}\n\nViết mô tả chi tiết dự án (plain text, các đoạn cách nhau bằng dòng trống). Nêu: bối cảnh, phạm vi công việc LAVIPCO thực hiện, giải pháp kỹ thuật, kết quả. Độ dài 200-400 từ.`,
        prompt: projectPrompt(ctx.data),
        maxTokens: 1500,
        temperature: 0.7,
      };
  }
}

function blogContentPrompt(data: BlogContext): string {
  const lines = [`Tiêu đề bài viết: "${data.title ?? "(chưa có tiêu đề)"}"`];
  if (data.tags && data.tags.length > 0) lines.push(`Tags: ${data.tags.join(", ")}`);
  if (data.outline) lines.push(`Dàn ý gợi ý:\n${data.outline}`);
  if (data.excerpt) lines.push(`Tóm tắt định hướng: ${data.excerpt}`);
  lines.push("\nHãy viết nội dung bài viết hoàn chỉnh.");
  return lines.join("\n");
}

function projectPrompt(data: ProjectContext): string {
  const lines: string[] = [];
  if (data.title) lines.push(`- Tên dự án: ${data.title}`);
  if (data.client) lines.push(`- Chủ đầu tư: ${data.client}`);
  if (data.location) lines.push(`- Địa điểm: ${data.location}`);
  if (data.year) lines.push(`- Năm thực hiện: ${data.year}`);
  if (data.categoryLabel) lines.push(`- Loại dự án: ${data.categoryLabel}`);
  if (data.scale) lines.push(`- Quy mô: ${data.scale}`);
  return `Thông tin dự án:\n${lines.join("\n") || "(chưa có thông tin)"}`;
}

/** Strip HTML tags để đưa content blog vào prompt excerpt/seo. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

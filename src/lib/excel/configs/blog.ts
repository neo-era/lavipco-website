import { splitList, parseBool, parseDate } from "../parse";
import type { EntityImportConfig } from "../types";

export const blogImportConfig: EntityImportConfig = {
  key: "blog",
  label: "Tin tức",
  sheetName: "Tin tức",
  columns: [
    { header: "Tiêu đề", field: "title", required: true, example: "Bài viết mẫu", note: "≥ 2 ký tự" },
    { header: "Slug", field: "slug", required: true, example: "bai-viet-mau", note: "Chữ thường-số-gạch. Trùng slug đã có → CẬP NHẬT." },
    { header: "Tóm tắt", field: "excerpt", example: "Mô tả ngắn", note: "Tối đa 500 ký tự" },
    { header: "Nội dung", field: "content", required: true, example: "<p>Nội dung...</p>", note: "HTML hoặc text, ≥ 20 ký tự" },
    { header: "Ảnh bìa (URL)", field: "coverImage", example: "https://res.cloudinary.com/...", note: "Dán URL ảnh (không nhúng file)" },
    { header: "Tags", field: "tags", example: "đèn LED|chiếu sáng", note: "Mỗi tag 1 dòng hoặc ngăn cách bằng |" },
    { header: "Ngày đăng", field: "publishedAt", example: "2026-05-01", note: "yyyy-mm-dd hoặc dd/MM/yyyy. Trống = chưa đăng." },
    { header: "Đã xuất bản", field: "isPublished", example: "có", note: "có/không, 1/0, x" },
    { header: "Meta title", field: "metaTitle", note: "SEO (tối đa 160)" },
    { header: "Meta description", field: "metaDescription", note: "SEO (tối đa 320)" },
  ],
  parseRow: (raw) => ({
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    excerpt: raw.excerpt || null,
    content: raw.content ?? "",
    coverImage: raw.coverImage || null,
    tags: splitList(raw.tags),
    publishedAt: parseDate(raw.publishedAt),
    isPublished: parseBool(raw.isPublished),
    metaTitle: raw.metaTitle || null,
    metaDescription: raw.metaDescription || null,
  }),
};

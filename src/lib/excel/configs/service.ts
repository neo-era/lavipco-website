import { parseBool, parseIntOrUndef } from "../parse";
import type { EntityImportConfig } from "../types";

/** Mỗi dòng `Tiêu đề :: Mô tả` → { title, description }. */
function parseSteps(cell: string | undefined): { title: string; description: string | null }[] {
  if (!cell) return [];
  return cell
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("::");
      if (idx === -1) return { title: line, description: null };
      return {
        title: line.slice(0, idx).trim(),
        description: line.slice(idx + 2).trim() || null,
      };
    })
    .filter((s) => s.title);
}

export const serviceImportConfig: EntityImportConfig = {
  key: "service",
  label: "Dịch vụ",
  sheetName: "Dịch vụ",
  columns: [
    { header: "Tiêu đề", field: "title", required: true, example: "Đèn tín hiệu giao thông", note: "≥ 2 ký tự" },
    { header: "Slug", field: "slug", required: true, example: "den-tin-hieu-giao-thong", note: "Chữ thường-số-gạch. Trùng slug → CẬP NHẬT." },
    { header: "Mô tả ngắn", field: "shortDescription", example: "Thiết kế, cung cấp, lắp đặt", note: "Tối đa 500 ký tự" },
    { header: "Mô tả", field: "description", required: true, example: "Mô tả chi tiết dịch vụ...", note: "≥ 10 ký tự (hỗ trợ Markdown)" },
    { header: "Icon", field: "icon", example: "TrafficCone", note: "Tên Lucide icon hoặc URL SVG" },
    { header: "Ảnh bìa (URL)", field: "coverImage", example: "https://...", note: "Dán URL ảnh" },
    { header: "Giá", field: "price", example: "5000000", note: "VND. Trống = Liên hệ báo giá." },
    { header: "Các bước", field: "processSteps", example: "Khảo sát :: Đo đạc hiện trạng\nThi công :: Lắp đặt thiết bị", note: "Mỗi dòng: Tiêu đề :: Mô tả" },
    { header: "Thứ tự", field: "sortOrder", example: "0", note: "Số nhỏ hiển thị trước" },
    { header: "Hiển thị", field: "isActive", example: "có", note: "có/không, 1/0" },
  ],
  parseRow: (raw) => ({
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    shortDescription: raw.shortDescription || null,
    description: raw.description ?? "",
    icon: raw.icon || null,
    coverImage: raw.coverImage || null,
    price: parseIntOrUndef(raw.price) ?? null,
    processSteps: parseSteps(raw.processSteps),
    sortOrder: parseIntOrUndef(raw.sortOrder) ?? 0,
    isActive: parseBool(raw.isActive),
  }),
};

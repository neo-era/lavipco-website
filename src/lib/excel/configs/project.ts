import {
  PROJECT_CATEGORY_LABELS,
  type ProjectCategoryValue,
} from "@/lib/validations/admin-project";
import { splitList, parseBool, parseIntOrUndef } from "../parse";
import type { EntityImportConfig } from "../types";

const LABEL_TO_ENUM: Record<string, ProjectCategoryValue> = Object.fromEntries(
  Object.entries(PROJECT_CATEGORY_LABELS).map(([k, v]) => [
    v.toLowerCase(),
    k as ProjectCategoryValue,
  ]),
);

/** Chấp nhận mã enum (TRAFFIC_LIGHT...) hoặc nhãn tiếng Việt. */
function parseCategory(cell: string | undefined): string {
  if (!cell) return "";
  const s = cell.trim();
  if (s in PROJECT_CATEGORY_LABELS) return s; // đã là mã enum
  return LABEL_TO_ENUM[s.toLowerCase()] ?? s; // không khớp → trả raw để schema báo lỗi
}

const CATEGORY_HINT = Object.entries(PROJECT_CATEGORY_LABELS)
  .map(([k, v]) => `${v} (${k})`)
  .join("; ");

export const projectImportConfig: EntityImportConfig = {
  key: "project",
  label: "Dự án",
  sheetName: "Dự án",
  columns: [
    { header: "Tiêu đề", field: "title", required: true, example: "Chiếu sáng đường Lê Lợi", note: "≥ 2 ký tự" },
    { header: "Slug", field: "slug", required: true, example: "chieu-sang-duong-le-loi", note: "Chữ thường-số-gạch. Trùng slug → CẬP NHẬT." },
    { header: "Tóm tắt", field: "summary", example: "Lắp đặt 120 trụ đèn LED", note: "Tối đa 500 ký tự" },
    { header: "Mô tả", field: "description", example: "Mô tả chi tiết dự án...", note: "Hỗ trợ Markdown" },
    { header: "Chủ đầu tư", field: "client", example: "UBND Quận 1" },
    { header: "Địa điểm", field: "location", example: "TP. Hồ Chí Minh" },
    { header: "Năm", field: "year", example: "2025", note: "Năm thực hiện (1900-2100)" },
    { header: "Quy mô", field: "scale", example: "120 trụ đèn, 5km" },
    { header: "Loại dự án", field: "category", required: true, example: "Chiếu sáng đô thị", note: `Nhập nhãn hoặc mã. Hợp lệ: ${CATEGORY_HINT}` },
    { header: "Ảnh (URL)", field: "images", example: "https://...|https://...", note: "Mỗi ảnh 1 dòng hoặc ngăn cách bằng |" },
    { header: "Video URL", field: "videoUrl", example: "https://youtube.com/...", note: "Link video (optional)" },
    { header: "Nổi bật", field: "isFeatured", example: "không", note: "có/không, 1/0" },
    { header: "Thứ tự", field: "sortOrder", example: "0", note: "Số nhỏ hiển thị trước" },
  ],
  parseRow: (raw) => ({
    title: raw.title ?? "",
    slug: raw.slug ?? "",
    summary: raw.summary || null,
    description: raw.description || null,
    client: raw.client || null,
    location: raw.location || null,
    year: parseIntOrUndef(raw.year) ?? null,
    scale: raw.scale || null,
    category: parseCategory(raw.category),
    images: splitList(raw.images),
    videoUrl: raw.videoUrl || null,
    isFeatured: parseBool(raw.isFeatured),
    sortOrder: parseIntOrUndef(raw.sortOrder) ?? 0,
  }),
};

import { z } from "zod";

import { slugSchema } from "@/lib/validations/shared";
import { productSpecItemSchema } from "@/lib/validations/admin-product";
import { splitList, parseBool, parseIntOrUndef } from "../parse";
import type { EntityImportConfig } from "../types";

/**
 * Schema import sản phẩm (v1: KHÔNG biến thể).
 * Khác productInputSchema: dùng `categorySlug` (tra cứu → categoryId ở action),
 * và không có variants.
 */
export const productImportSchema = z
  .object({
    name: z.string().min(2, { message: "Tên ≥ 2 ký tự" }).max(255),
    slug: slugSchema,
    brand: z.string().max(80).nullable().optional(),
    categorySlug: z.string().min(1, { message: "Thiếu slug danh mục" }),
    shortDescription: z.string().max(500).nullable().optional(),
    description: z.string().max(20_000).nullable().optional(),
    priceOnRequest: z.boolean(),
    basePrice: z.number().int().nonnegative().optional(),
    simpleStock: z.number().int().nonnegative().max(99999).optional(),
    images: z.array(z.string().min(1)).max(20),
    specs: z.array(productSpecItemSchema).max(50),
    metaTitle: z.string().max(160).nullable().optional(),
    metaDescription: z.string().max(320).nullable().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    catalogueUrl: z.string().max(500).nullable().optional(),
  })
  .refine(
    (d) => d.priceOnRequest || (d.basePrice !== undefined && d.basePrice > 0),
    { message: "Cần Giá cơ bản hoặc bật Liên hệ báo giá", path: ["basePrice"] },
  );

export type ProductImportInput = z.infer<typeof productImportSchema>;

/** Mỗi dòng `tên=giá trị (đơn vị)` → { key, value, unit? }. */
function parseSpecs(
  cell: string | undefined,
): { key: string; value: string; unit?: string }[] {
  if (!cell) return [];
  const out: { key: string; value: string; unit?: string }[] = [];
  for (const line of cell.split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    let unit: string | undefined;
    const m = value.match(/^(.*)\(([^)]*)\)\s*$/);
    if (m) {
      value = m[1].trim();
      unit = m[2].trim() || undefined;
    }
    if (!key || !value) continue;
    out.push(unit ? { key, value, unit } : { key, value });
  }
  return out;
}

export const productImportConfig: EntityImportConfig = {
  key: "product",
  label: "Sản phẩm",
  sheetName: "Sản phẩm",
  columns: [
    { header: "Tên", field: "name", required: true, example: "Đèn LED đường phố 100W", note: "≥ 2 ký tự" },
    { header: "Slug", field: "slug", required: true, example: "den-led-duong-pho-100w", note: "Chữ thường-số-gạch. Trùng slug → CẬP NHẬT." },
    { header: "Thương hiệu", field: "brand", example: "LAVIPCO" },
    { header: "Slug danh mục", field: "categorySlug", required: true, example: "den-led", note: "Phải khớp slug danh mục có sẵn (xem sheet Danh mục)" },
    { header: "Mô tả ngắn", field: "shortDescription", example: "Đèn LED tiết kiệm điện", note: "Tối đa 500 ký tự" },
    { header: "Mô tả", field: "description", example: "Mô tả chi tiết...", note: "Tối đa 20.000 ký tự" },
    { header: "Liên hệ báo giá", field: "priceOnRequest", example: "không", note: "có = ẩn giá; không = cần Giá cơ bản" },
    { header: "Giá cơ bản", field: "basePrice", example: "1500000", note: "VND. Bắt buộc nếu không Liên hệ báo giá." },
    { header: "Tồn kho", field: "simpleStock", example: "50", note: "Số lượng tồn (sản phẩm không biến thể)" },
    { header: "Ảnh (URL)", field: "images", example: "https://...|https://...", note: "Mỗi ảnh 1 dòng hoặc ngăn cách bằng |" },
    { header: "Thông số", field: "specs", example: "Công suất=100 (W)\nĐiện áp=220 (V)", note: "Mỗi dòng: tên=giá trị (đơn vị)" },
    { header: "Meta title", field: "metaTitle", note: "SEO" },
    { header: "Meta description", field: "metaDescription", note: "SEO" },
    { header: "Trạng thái", field: "status", required: true, example: "ACTIVE", note: "DRAFT / ACTIVE / ARCHIVED" },
    { header: "Nổi bật", field: "isFeatured", example: "không", note: "có/không, 1/0" },
    { header: "Catalogue URL", field: "catalogueUrl", example: "https://.../catalogue.pdf", note: "Link PDF (optional)" },
  ],
  parseRow: (raw) => ({
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    brand: raw.brand || null,
    categorySlug: (raw.categorySlug ?? "").trim(),
    shortDescription: raw.shortDescription || null,
    description: raw.description || null,
    priceOnRequest: parseBool(raw.priceOnRequest),
    basePrice: parseIntOrUndef(raw.basePrice),
    simpleStock: parseIntOrUndef(raw.simpleStock),
    images: splitList(raw.images),
    specs: parseSpecs(raw.specs),
    metaTitle: raw.metaTitle || null,
    metaDescription: raw.metaDescription || null,
    status: (raw.status || "DRAFT").trim().toUpperCase(),
    isFeatured: parseBool(raw.isFeatured),
    catalogueUrl: raw.catalogueUrl || null,
  }),
};

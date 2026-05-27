/**
 * Zod schema cho admin product form.
 */
import { z } from "zod";

import { slugSchema } from "./shared";

export const productSpecItemSchema = z.object({
  key: z.string().min(1, { message: "Tên thông số bắt buộc" }).max(80),
  value: z.string().min(1, { message: "Giá trị bắt buộc" }).max(200),
  unit: z.string().max(20).optional(),
});
export type ProductSpecItem = z.infer<typeof productSpecItemSchema>;

export const productVariantInputSchema = z.object({
  /** Existing variant id khi update; undefined khi create mới. */
  id: z.string().optional(),
  sku: z
    .string()
    .min(1, { message: "SKU bắt buộc" })
    .max(80)
    .regex(/^[A-Z0-9-]+$/, {
      message: "SKU chỉ chữ HOA, số và dấu gạch",
    }),
  name: z.string().max(120).nullable().optional(),
  price: z.number().int().nonnegative({ message: "Giá ≥ 0" }),
  stock: z.number().int().nonnegative().max(99999),
  isDefault: z.boolean().optional(),
  /** Object thuộc tính từ combination builder: { "Màu sắc": "Đỏ", "Công suất": "100W" } */
  attributes: z.record(z.string(), z.string()).optional(),
});
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;

export const productInputSchema = z
  .object({
    // Card 1: Thông tin cơ bản
    name: z.string().min(2, { message: "Tên sản phẩm ≥ 2 ký tự" }).max(255),
    slug: slugSchema,
    brand: z.string().max(80).nullable().optional(),
    categoryId: z.string().min(1, { message: "Chọn danh mục" }),
    shortDescription: z.string().max(500).nullable().optional(),
    description: z.string().max(20_000).nullable().optional(),

    // Card 2: Giá và kho
    priceOnRequest: z.boolean(),
    basePrice: z.number().int().nonnegative().optional(),
    // simpleStock: dùng khi không có variant; nếu có variants thì tính tổng từ variants
    simpleStock: z.number().int().nonnegative().max(99999).optional(),

    // Card 3: Hình ảnh - mảng URL Cloudinary hoặc data URL
    images: z.array(z.string().min(1)).max(20),

    // Card 4: Thông số kỹ thuật
    specs: z.array(productSpecItemSchema).max(50),

    // Card 5: Variants
    hasVariants: z.boolean(),
    variants: z.array(productVariantInputSchema).max(50),

    // Card 6: SEO
    metaTitle: z.string().max(160).nullable().optional(),
    metaDescription: z.string().max(320).nullable().optional(),

    // Card 7: Cấu hình
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    catalogueUrl: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      // Nếu không priceOnRequest → basePrice bắt buộc
      if (!data.priceOnRequest && (data.basePrice === undefined || data.basePrice <= 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng nhập giá cơ bản (hoặc bật Liên hệ báo giá)",
      path: ["basePrice"],
    },
  )
  .refine(
    (data) => {
      // Nếu hasVariants → ít nhất 1 variant
      if (data.hasVariants && data.variants.length === 0) return false;
      return true;
    },
    {
      message: "Cần ít nhất 1 biến thể khi bật Có biến thể",
      path: ["variants"],
    },
  );

export type ProductInput = z.infer<typeof productInputSchema>;

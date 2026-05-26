/**
 * Type chung dùng nhiều nơi.
 * Các type domain (Product, Order…) lấy từ Prisma Client (`@prisma/client`),
 * file này chỉ chứa type cross-cutting/UI.
 */

export type NavItem = {
  title: string;
  href: string;
  external?: boolean;
};

export type ServiceCategoryKey =
  | "traffic-light"
  | "smart-lighting"
  | "landscape"
  | "power-infra"
  | "smart-city"
  | "other";

export type ProjectCategoryKey = ServiceCategoryKey;

/**
 * Spec sản phẩm — lưu dạng JSON trong Product.specs.
 * Cho phép key tự do nhưng khuyến nghị dùng các key chuẩn dưới đây.
 */
export type ProductSpec = {
  power?: string; // ví dụ "120W"
  voltage?: string; // ví dụ "220VAC"
  ipRating?: string; // ví dụ "IP66"
  cct?: string; // nhiệt độ màu, ví dụ "5000K"
  lumen?: string; // ví dụ "16000 lm"
  beamAngle?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  warranty?: string;
  standards?: string[]; // tiêu chuẩn áp dụng
  [k: string]: unknown;
};

/**
 * Variant attribute — lưu dạng JSON trong ProductVariant.attributes.
 */
export type VariantAttributes = {
  color?: string;
  power?: string;
  cct?: string;
  size?: string;
  [k: string]: unknown;
};

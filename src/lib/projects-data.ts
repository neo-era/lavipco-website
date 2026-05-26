/**
 * Dữ liệu phụ cho domain Dự án (Project).
 * - Label tiếng Việt cho enum ProjectCategory
 * - Mapping ProjectCategory → product Category slug & Service slug để lấy related
 * - Helper parse video URL (YouTube/Vimeo/MP4)
 */
import type { ProjectCategory } from "@prisma/client";

export const PROJECTS_PAGE_SIZE = 9;

export type ProjectCategoryMeta = {
  label: string;
  /** Slug của Category sản phẩm liên quan (để query Product). */
  productCategorySlug: string | null;
  /** Slug của Service liên quan (để link sang trang dịch vụ). */
  serviceSlug: string | null;
};

export const PROJECT_CATEGORY_META: Record<ProjectCategory, ProjectCategoryMeta> = {
  TRAFFIC_LIGHT: {
    label: "Đèn tín hiệu giao thông",
    productCategorySlug: "den-tin-hieu",
    serviceSlug: "den-tin-hieu-giao-thong",
  },
  URBAN_LIGHTING: {
    label: "Chiếu sáng đô thị thông minh",
    productCategorySlug: "den-led-duong-pho",
    serviceSlug: "chieu-sang-do-thi-thong-minh",
  },
  LANDSCAPE_LIGHTING: {
    label: "Chiếu sáng cảnh quan",
    productCategorySlug: "den-pha-canh-quan",
    serviceSlug: "chieu-sang-canh-quan",
  },
  POWER_INFRASTRUCTURE: {
    label: "Hạ tầng điện",
    productCategorySlug: "tu-dieu-khien",
    serviceSlug: "ha-tang-dien",
  },
  SMART_CITY: {
    label: "Smart City",
    productCategorySlug: "tu-dieu-khien",
    serviceSlug: null,
  },
  OTHER: {
    label: "Khác",
    productCategorySlug: null,
    serviceSlug: null,
  },
};

/** Sắp xếp filter tabs ở trang list. */
export const PROJECT_CATEGORY_ORDER: ProjectCategory[] = [
  "TRAFFIC_LIGHT",
  "URBAN_LIGHTING",
  "LANDSCAPE_LIGHTING",
  "POWER_INFRASTRUCTURE",
  "SMART_CITY",
  "OTHER",
];

/** Validate raw string từ URL searchParam có phải ProjectCategory hợp lệ không. */
export function parseProjectCategory(value: string | undefined): ProjectCategory | null {
  if (!value) return null;
  return (PROJECT_CATEGORY_ORDER as string[]).includes(value)
    ? (value as ProjectCategory)
    : null;
}

// ====================================================================
// Video embed helper
// ====================================================================

export type VideoEmbed = {
  type: "youtube" | "vimeo" | "mp4";
  embedUrl: string;
};

/**
 * Parse Project.videoUrl thành embed URL.
 * Hỗ trợ: YouTube (watch?v=, youtu.be), Vimeo, link mp4/webm trực tiếp.
 * Trả về null nếu không nhận diện được.
 */
export function parseVideoEmbed(url: string | null | undefined): VideoEmbed | null {
  if (!url) return null;

  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };

  // mp4/webm
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { type: "mp4", embedUrl: url };

  return null;
}

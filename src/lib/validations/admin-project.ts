/**
 * Zod schema cho admin project CRUD.
 */
import { z } from "zod";

import { slugSchema } from "./shared";

export const projectCategoryEnum = z.enum([
  "TRAFFIC_LIGHT",
  "URBAN_LIGHTING",
  "LANDSCAPE_LIGHTING",
  "POWER_INFRASTRUCTURE",
  "SMART_CITY",
  "OTHER",
]);
export type ProjectCategoryValue = z.infer<typeof projectCategoryEnum>;

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategoryValue, string> = {
  TRAFFIC_LIGHT: "Đèn tín hiệu giao thông",
  URBAN_LIGHTING: "Chiếu sáng đô thị",
  LANDSCAPE_LIGHTING: "Chiếu sáng cảnh quan",
  POWER_INFRASTRUCTURE: "Hạ tầng điện",
  SMART_CITY: "Smart City",
  OTHER: "Khác",
};

export const projectInputSchema = z.object({
  title: z.string().min(2, { message: "Tiêu đề ≥ 2 ký tự" }).max(255),
  slug: slugSchema,
  summary: z.string().max(500).nullable().optional(),
  description: z.string().max(20_000).nullable().optional(),
  client: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullable()
    .optional(),
  scale: z.string().max(255).nullable().optional(),
  category: projectCategoryEnum,
  images: z.array(z.string().min(1)).max(30),
  videoUrl: z.string().max(500).nullable().optional(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

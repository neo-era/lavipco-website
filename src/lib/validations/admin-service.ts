/**
 * Zod schema cho admin service CRUD.
 */
import { z } from "zod";

import { slugSchema } from "./shared";

export const serviceProcessStepSchema = z.object({
  title: z.string().min(1, { message: "Tên bước bắt buộc" }).max(120),
  description: z.string().max(500).nullable().optional(),
});

export const serviceInputSchema = z.object({
  title: z.string().min(2, { message: "Tiêu đề ≥ 2 ký tự" }).max(255),
  slug: slugSchema,
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().min(10, { message: "Mô tả ≥ 10 ký tự" }).max(20_000),
  icon: z.string().max(120).nullable().optional(),
  coverImage: z.string().max(2000).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  processSteps: z.array(serviceProcessStepSchema).max(20),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export type ServiceProcessStep = z.infer<typeof serviceProcessStepSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;

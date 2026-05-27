/**
 * Zod schema cho admin blog post CRUD.
 */
import { z } from "zod";

import { slugSchema } from "./shared";

export const blogPostInputSchema = z.object({
  title: z.string().min(2, { message: "Tiêu đề ≥ 2 ký tự" }).max(255),
  slug: slugSchema,
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().min(20, { message: "Nội dung tối thiểu 20 ký tự" }).max(200_000),
  coverImage: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20),
  publishedAt: z.string().nullable().optional(),
  isPublished: z.boolean(),
  metaTitle: z.string().max(160).nullable().optional(),
  metaDescription: z.string().max(320).nullable().optional(),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

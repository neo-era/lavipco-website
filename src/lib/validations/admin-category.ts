/**
 * Zod schema cho admin category (danh mục sản phẩm) CRUD.
 */
import { z } from "zod";

import { slugSchema } from "./shared";

export const categoryInputSchema = z.object({
  name: z.string().min(2, { message: "Tên ≥ 2 ký tự" }).max(120),
  slug: slugSchema,
  description: z.string().max(2000).nullable().optional(),
  image: z.string().max(2000).nullable().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

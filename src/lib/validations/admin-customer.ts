/**
 * Zod schema cho admin customer actions.
 */
import { z } from "zod";

export const updateCustomerTagsSchema = z.object({
  tags: z
    .array(z.string().min(1).max(40))
    .max(10, { message: "Tối đa 10 tag" }),
});

export const updateCustomerNoteSchema = z.object({
  note: z.string().max(2000),
});

export type UpdateCustomerTagsInput = z.infer<typeof updateCustomerTagsSchema>;
export type UpdateCustomerNoteInput = z.infer<typeof updateCustomerNoteSchema>;

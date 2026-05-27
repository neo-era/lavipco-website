/**
 * Zod schema cho admin contact message actions.
 */
import { z } from "zod";

export const contactStatusEnum = z.enum(["NEW", "READ", "REPLIED", "CLOSED"]);
export type ContactStatusValue = z.infer<typeof contactStatusEnum>;

export const updateMessageStatusSchema = z.object({
  status: contactStatusEnum,
});

export const replyMessageSchema = z.object({
  body: z
    .string()
    .min(10, { message: "Nội dung trả lời tối thiểu 10 ký tự" })
    .max(10_000),
  sendEmail: z.boolean(),
});

export const bulkMessageActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, { message: "Chọn ít nhất 1 tin nhắn" }),
  action: z.enum(["MARK_READ", "MARK_CLOSED", "DELETE"]),
});

export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
export type ReplyMessageInput = z.infer<typeof replyMessageSchema>;
export type BulkMessageActionInput = z.infer<typeof bulkMessageActionSchema>;

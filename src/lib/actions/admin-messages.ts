"use server";

/**
 * Admin contact-message actions.
 */
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { buildContactReplyEmail } from "@/lib/email/templates/contact-reply";
import {
  updateMessageStatusSchema,
  replyMessageSchema,
  bulkMessageActionSchema,
  type UpdateMessageStatusInput,
  type ReplyMessageInput,
  type BulkMessageActionInput,
} from "@/lib/validations/admin-message";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
  return { userId: session.user.id };
}

export async function markMessageRead(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const msg = await db.contactMessage.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!msg) return { ok: false, error: "Không tìm thấy tin nhắn" };

    if (msg.status === "NEW") {
      await db.contactMessage.update({
        where: { id },
        data: { status: "READ" },
      });
    }
    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${id}`);
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("[markMessageRead]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function updateMessageStatus(
  id: string,
  input: UpdateMessageStatusInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = updateMessageStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const msg = await db.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!msg) return { ok: false, error: "Không tìm thấy tin nhắn" };

    await db.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${id}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateMessageStatus]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

export async function replyToMessage(
  id: string,
  input: ReplyMessageInput,
): Promise<ActionResult<{ emailSent: boolean }>> {
  let admin: { userId: string };
  try {
    admin = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = replyMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { body, sendEmail: shouldSend } = parsed.data;

  try {
    const msg = await db.contactMessage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
      },
    });
    if (!msg) return { ok: false, error: "Không tìm thấy tin nhắn" };

    let emailSent = false;
    if (shouldSend) {
      const { subject, html, text } = buildContactReplyEmail({
        customerName: msg.name,
        originalMessage: msg.message,
        originalSubject: msg.subject,
        replyBody: body,
      });
      const result = await sendEmail({
        to: msg.email,
        subject,
        html,
        text,
      });
      emailSent = result.ok;
      if (!result.ok) {
        // Vẫn lưu reply local + cảnh báo email fail (không block save)
        console.warn("[replyToMessage] email fail:", result.error);
      }
    }

    // Lưu reply + đổi status REPLIED
    await db.$transaction([
      db.contactReply.create({
        data: {
          messageId: id,
          byUserId: admin.userId,
          body,
          sentEmail: emailSent,
        },
      }),
      db.contactMessage.update({
        where: { id },
        data: { status: "REPLIED" },
      }),
    ]);

    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${id}`);
    revalidatePath("/admin/dashboard");
    return { ok: true, data: { emailSent } };
  } catch (error) {
    console.error("[replyToMessage]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi reply" };
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const msg = await db.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!msg) return { ok: false, error: "Không tìm thấy tin nhắn" };

    await db.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("[deleteMessage]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi xoá" };
  }
}

export async function bulkMessageAction(
  input: BulkMessageActionInput,
): Promise<ActionResult<{ count: number }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = bulkMessageActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { ids, action } = parsed.data;

  try {
    let count = 0;
    if (action === "DELETE") {
      const res = await db.contactMessage.deleteMany({
        where: { id: { in: ids } },
      });
      count = res.count;
    } else {
      const status = action === "MARK_READ" ? "READ" : "CLOSED";
      const res = await db.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });
      count = res.count;
    }
    revalidatePath("/admin/messages");
    revalidatePath("/admin/dashboard");
    return { ok: true, data: { count } };
  } catch (error) {
    console.error("[bulkMessageAction]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

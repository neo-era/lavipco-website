import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, Calendar, MessageSquare, History } from "lucide-react";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { markMessageRead } from "@/lib/actions/admin-messages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminMessageReplyForm } from "@/components/admin/AdminMessageReplyForm";

export const metadata: Metadata = { title: "Chi tiết tin nhắn" };

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "brand" | "accent" }
> = {
  NEW: { label: "Mới", variant: "accent" },
  READ: { label: "Đã đọc", variant: "secondary" },
  REPLIED: { label: "Đã trả lời", variant: "default" },
  CLOSED: { label: "Đã đóng", variant: "outline" },
};

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Auth check (defense-in-depth, middleware đã chặn /admin/*)
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") notFound();

  const { id } = await params;
  const message = await db.contactMessage.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!message) notFound();

  // Auto đánh dấu READ khi admin mở chi tiết (chỉ khi đang NEW)
  if (message.status === "NEW") {
    await markMessageRead(id);
  }

  // Lookup admin của các reply
  const replyUserIds = Array.from(
    new Set(message.replies.map((r) => r.byUserId).filter((v): v is string => Boolean(v))),
  );
  const replyUsers = replyUserIds.length
    ? await db.user.findMany({
        where: { id: { in: replyUserIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const userMap = new Map(replyUsers.map((u) => [u.id, u]));

  const statusMeta = STATUS_META[message.status];

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/messages">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">
            {message.subject || "(không tiêu đề)"}
          </h1>
          <Badge variant={statusMeta.variant} className="rounded-full">
            {statusMeta.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left: message + replies + reply form (2/3) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Message body */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-4 w-4 text-brand-primary" />
              Nội dung tin nhắn
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.message}
            </div>
          </div>

          {/* Reply form */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Mail className="h-4 w-4 text-brand-primary" />
              Trả lời
            </h2>
            <AdminMessageReplyForm
              messageId={message.id}
              customerName={message.name}
            />
          </div>

          {/* Reply history */}
          {message.replies.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <History className="h-4 w-4 text-brand-primary" />
                Lịch sử trả lời ({message.replies.length})
              </h2>
              <ul className="space-y-3">
                {message.replies.map((r) => {
                  const byUser = r.byUserId ? userMap.get(r.byUserId) : null;
                  const byLabel =
                    byUser?.name || byUser?.email || "Hệ thống";
                  return (
                    <li
                      key={r.id}
                      className="rounded-md border bg-muted/30 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{byLabel}</span>
                          <span className="text-muted-foreground">
                            · {formatDateTime(r.createdAt)}
                          </span>
                        </div>
                        <Badge
                          variant={r.sentEmail ? "default" : "outline"}
                          className="rounded-full text-[10px]"
                        >
                          {r.sentEmail ? "Đã gửi email" : "Nội bộ"}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {r.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Right sidebar: sender info (1/3) */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Người gửi
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold">{message.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={`mailto:${message.email}`}
                  className="text-brand-primary hover:underline"
                >
                  {message.email}
                </a>
              </div>
              {message.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <a
                    href={`tel:${message.phone}`}
                    className="text-brand-primary hover:underline"
                  >
                    {message.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">{formatDateTime(message.createdAt)}</span>
              </div>
              {message.ipAddress && (
                <p className="text-[11px] text-muted-foreground">
                  IP: <span className="font-mono">{message.ipAddress}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

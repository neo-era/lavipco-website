import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import type { ContactMessage } from "@prisma/client";

import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UnreadMessage = Pick<
  ContactMessage,
  "id" | "name" | "email" | "subject" | "createdAt"
>;

export function UnreadMessagesPanel({
  messages,
}: {
  messages: UnreadMessage[];
}) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        <MessageSquare className="h-5 w-5" />
        Không có tin nhắn chưa đọc 👍
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[10px]">
                Mới
              </Badge>
              <p className="truncate text-sm font-medium">{msg.name}</p>
            </div>
            <p className="truncate text-xs text-muted-foreground">{msg.email}</p>
            {msg.subject && (
              <p className="mt-1 truncate text-sm">{msg.subject}</p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatDateTime(msg.createdAt)}
            </p>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/admin/messages/${msg.id}`}>
              Xem <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

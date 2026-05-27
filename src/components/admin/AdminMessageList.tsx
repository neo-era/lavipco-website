"use client";

/**
 * Table list cho /admin/messages với bulk select + bulk actions.
 *  - Checkbox mỗi row + checkbox "select all" header
 *  - Bulk action bar khi có row checked
 *  - Single row delete với confirm dialog
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MailOpen,
  Trash2,
  Loader2,
  Archive,
} from "lucide-react";
import type { ContactStatus, ContactMessage } from "@prisma/client";

import {
  bulkMessageAction,
  deleteMessage,
} from "@/lib/actions/admin-messages";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MessageRow = Pick<
  ContactMessage,
  "id" | "name" | "email" | "phone" | "subject" | "status" | "createdAt"
>;

const STATUS_META: Record<
  ContactStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "brand" | "accent" }
> = {
  NEW: { label: "Mới", variant: "accent" },
  READ: { label: "Đã đọc", variant: "secondary" },
  REPLIED: { label: "Đã trả lời", variant: "default" },
  CLOSED: { label: "Đã đóng", variant: "outline" },
};

export function AdminMessageList({ messages }: { messages: MessageRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(messages.map((m) => m.id)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleBulk(action: "MARK_READ" | "MARK_CLOSED" | "DELETE") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await bulkMessageAction({ ids, action });
      if (res.ok) {
        toast({
          title: `✓ Đã ${
            action === "DELETE"
              ? "xoá"
              : action === "MARK_READ"
                ? "đánh dấu đã đọc"
                : "đóng"
          }`,
          description: `${res.data?.count ?? ids.length} tin nhắn`,
        });
        setSelected(new Set());
        setConfirmBulkDelete(false);
        router.refresh();
      } else {
        toast({
          title: "Lỗi bulk action",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handleSingleDelete() {
    if (!confirmDeleteId) return;
    startTransition(async () => {
      const res = await deleteMessage(confirmDeleteId);
      if (res.ok) {
        toast({ title: "Đã xoá tin nhắn" });
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        toast({
          title: "Xoá thất bại",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
        <MailOpen className="h-8 w-8" />
        Không có tin nhắn nào phù hợp với bộ lọc.
      </div>
    );
  }

  const allChecked = messages.length > 0 && selected.size === messages.length;
  const someChecked = selected.size > 0 && selected.size < messages.length;

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-brand-primary/5 px-3 py-2">
          <p className="text-sm">
            Đã chọn <strong>{selected.size}</strong> tin nhắn
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulk("MARK_READ")}
              disabled={pending}
            >
              <MailOpen className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulk("MARK_CLOSED")}
              disabled={pending}
            >
              <Archive className="h-3.5 w-3.5" />
              Đóng
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmBulkDelete(true)}
              disabled={pending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xoá
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(new Set())}
              disabled={pending}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36px]">
                <Checkbox
                  checked={allChecked || (someChecked ? "indeterminate" : false)}
                  onCheckedChange={(c) => toggleAll(c === true)}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead className="hidden md:table-cell">Tiêu đề</TableHead>
              <TableHead className="hidden lg:table-cell">SĐT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden xl:table-cell">Ngày gửi</TableHead>
              <TableHead className="w-[60px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((m) => {
              const statusMeta = STATUS_META[m.status];
              const isChecked = selected.has(m.id);
              return (
                <TableRow
                  key={m.id}
                  data-state={isChecked ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(c) => toggleOne(m.id, c === true)}
                      aria-label={`Chọn tin ${m.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/messages/${m.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {m.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell className="hidden max-w-[300px] md:table-cell">
                    <p className="truncate text-sm">{m.subject || "(không tiêu đề)"}</p>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {m.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusMeta.variant}
                      className="rounded-full text-[10px]"
                    >
                      {statusMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                    {formatDateTime(m.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Link href={`/admin/messages/${m.id}`} aria-label="Xem">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setConfirmDeleteId(m.id)}
                        aria-label="Xoá"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Bulk delete dialog */}
      <Dialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá {selected.size} tin nhắn?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Mọi lịch sử trả lời của các tin nhắn
              được chọn cũng sẽ bị xoá.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmBulkDelete(false)}
              disabled={pending}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleBulk("DELETE")}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single delete dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá tin nhắn?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteId(null)}
              disabled={pending}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleSingleDelete}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

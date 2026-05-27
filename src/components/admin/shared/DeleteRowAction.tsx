"use client";

/**
 * Generic delete confirm + dropdown menu cho admin list rows.
 * Caller pass `onDelete` async function trả về { ok, error? }.
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  /** Label hiển thị trong dialog confirm (vd: tên dự án, tiêu đề bài). */
  label: string;
  /** Link tới trang edit. */
  editHref: string;
  /** Link xem trang public (optional). */
  publicHref?: string;
  /** Async action xoá. */
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  /** Loại entity hiển thị: "dự án", "dịch vụ", "bài viết"... */
  entityName: string;
};

export function DeleteRowAction({
  label,
  editHref,
  publicHref,
  onDelete,
  entityName,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await onDelete();
      if (res.ok) {
        toast({ title: `Đã xoá ${entityName}`, description: label });
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Không thể xoá",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Tuỳ chọn">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={editHref}>
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </Link>
          </DropdownMenuItem>
          {publicHref && (
            <DropdownMenuItem asChild>
              <Link href={publicHref} target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4" /> Xem trang public
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Xoá {entityName} &quot;{label}&quot;?
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={pending}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

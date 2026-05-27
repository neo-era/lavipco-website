"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Power, Trash2, Loader2 } from "lucide-react";

import {
  deleteCoupon,
  toggleCouponActive,
} from "@/lib/actions/admin-coupons";
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
  id: string;
  code: string;
  isActive: boolean;
  usedCount: number;
};

export function AdminCouponRowActions({ id, code, isActive, usedCount }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleCouponActive(id);
      if (res.ok) {
        toast({ title: isActive ? "Đã tắt mã" : "Đã bật mã", description: code });
        router.refresh();
      } else {
        toast({ title: "Lỗi", description: res.error, variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.ok) {
        toast({ title: "Đã xoá mã", description: code });
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast({ title: "Không thể xoá", description: res.error, variant: "destructive" });
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
            <Link href={`/admin/coupons/${id}`}>
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            <Power className="h-4 w-4" />
            {isActive ? "Tắt mã" : "Bật mã"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Xoá mã
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá mã {code}?</DialogTitle>
            <DialogDescription>
              {usedCount > 0 ? (
                <>
                  Mã này đã được sử dụng <strong>{usedCount} lần</strong>. Xoá sẽ không
                  ảnh hưởng đơn hàng cũ nhưng mã sẽ biến mất khỏi danh sách. Cân nhắc
                  tắt mã thay vì xoá.
                </>
              ) : (
                "Hành động này không thể hoàn tác."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={pending}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

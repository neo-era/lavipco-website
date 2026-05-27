"use client";

/**
 * Row actions (3-dot menu) cho 1 sản phẩm ở admin list:
 *  - Sửa (link tới /admin/products/[id])
 *  - Đổi trạng thái nhanh (DRAFT/ACTIVE/ARCHIVED)
 *  - Toggle Nổi bật
 *  - Xoá (có confirm dialog)
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Archive,
  Loader2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  deleteProduct,
  updateProductStatus,
  toggleProductFeatured,
} from "@/lib/actions/admin-products";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
};

export function AdminProductRowActions({ id, name, slug, status, isFeatured }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  function handleStatus(next: "DRAFT" | "ACTIVE" | "ARCHIVED") {
    if (next === status) return;
    startTransition(async () => {
      const res = await updateProductStatus(id, next);
      if (res.ok) {
        toast({ title: "Đã đổi trạng thái", description: `Sản phẩm "${name}" → ${next}` });
        router.refresh();
      } else {
        toast({ title: "Lỗi", description: res.error, variant: "destructive" });
      }
    });
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      const res = await toggleProductFeatured(id);
      if (res.ok) {
        toast({
          title: isFeatured ? "Đã bỏ nổi bật" : "Đã đánh dấu nổi bật",
        });
        router.refresh();
      } else {
        toast({ title: "Lỗi", description: res.error, variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.ok) {
        toast({ title: "Đã xoá sản phẩm", description: name });
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
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${id}`}>
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/products/${slug}`} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" /> Xem trang public
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Trạng thái</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleStatus("ACTIVE")} disabled={status === "ACTIVE"}>
            <Eye className="h-4 w-4" /> Đăng bán (ACTIVE)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatus("DRAFT")} disabled={status === "DRAFT"}>
            <EyeOff className="h-4 w-4" /> Nháp (DRAFT)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatus("ARCHIVED")} disabled={status === "ARCHIVED"}>
            <Archive className="h-4 w-4" /> Lưu trữ (ARCHIVED)
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleFeatured}>
            <Star
              className={`h-4 w-4 ${isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            {isFeatured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Xoá sản phẩm
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá sản phẩm?</DialogTitle>
            <DialogDescription>
              Bạn sắp xoá <span className="font-semibold text-foreground">{name}</span>.
              Hành động này không thể hoàn tác. Nếu sản phẩm đã có trong đơn hàng,
              hãy chọn <strong>ARCHIVED</strong> thay vì xoá.
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

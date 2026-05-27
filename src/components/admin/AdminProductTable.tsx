import Link from "next/link";
import Image from "next/image";
import { Package, Star } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminProductRowActions } from "./AdminProductRowActions";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  categoryName: string;
  basePrice: number;
  priceOnRequest: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  totalStock: number;
  variantCount: number;
  cover: string | null;
  createdAt: Date;
};

const STATUS_META: Record<
  "DRAFT" | "ACTIVE" | "ARCHIVED",
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  ACTIVE: { label: "Đang bán", variant: "default" },
  DRAFT: { label: "Nháp", variant: "secondary" },
  ARCHIVED: { label: "Lưu trữ", variant: "outline" },
};

export function AdminProductTable({ rows }: { rows: AdminProductRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
        <Package className="h-8 w-8" />
        Chưa có sản phẩm nào phù hợp.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Ảnh</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="hidden md:table-cell">Danh mục</TableHead>
            <TableHead className="text-right">Giá</TableHead>
            <TableHead className="hidden text-right xl:table-cell">Kho</TableHead>
            <TableHead className="hidden lg:table-cell">Trạng thái</TableHead>
            <TableHead className="hidden xl:table-cell">Ngày tạo</TableHead>
            <TableHead className="w-[60px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => {
            const statusMeta = STATUS_META[p.status];
            return (
              <TableRow key={p.id}>
                <TableCell>
                  {p.cover ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={p.cover}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-foreground hover:text-brand-primary"
                    >
                      {p.name}
                      {p.isFeatured && (
                        <Star className="ml-1 inline-block h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      )}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {p.brand ? `${p.brand} · ` : ""}
                      {p.variantCount} biến thể
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {p.categoryName}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {p.priceOnRequest ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      Liên hệ
                    </span>
                  ) : (
                    formatCurrency(p.basePrice)
                  )}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums xl:table-cell">
                  <span
                    className={
                      p.totalStock === 0 ? "text-destructive" : "text-foreground/80"
                    }
                  >
                    {p.totalStock}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant={statusMeta.variant} className="rounded-full text-[10px]">
                    {statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                  {formatDate(p.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <AdminProductRowActions
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    status={p.status}
                    isFeatured={p.isFeatured}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

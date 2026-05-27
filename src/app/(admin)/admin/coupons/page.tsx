import type { Metadata } from "next";
import Link from "next/link";
import { Plus, TicketPercent } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ADMIN_TABLE_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/Pagination";
import { AdminCouponRowActions } from "@/components/admin/AdminCouponRowActions";

export const metadata: Metadata = { title: "Khuyến mãi" };

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  page?: string;
};

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.CouponWhereInput = {};
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [coupons, total] = await Promise.all([
    db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
    }),
    db.coupon.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const now = new Date();

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/coupons?${qs}` : "/admin/coupons";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý mã giảm giá: PERCENT/FIXED, thời hạn, giới hạn lượt dùng.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4" />
            Thêm mã
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form className="flex gap-2" action="/admin/coupons" method="get">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo mã hoặc mô tả..."
        />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Chưa có mã nào."
          : `Hiển thị ${skip + 1}–${skip + coupons.length} trên tổng ${total} mã`}
      </p>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <TicketPercent className="h-8 w-8" />
          Chưa có mã giảm giá. Bấm <strong>Thêm mã</strong> để tạo mới.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Đã dùng / Giới hạn
                </TableHead>
                <TableHead className="hidden lg:table-cell">Hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => {
                const expired = new Date(c.validTo) < now;
                const notYet = new Date(c.validFrom) > now;
                const exhausted =
                  c.usageLimit !== null && c.usedCount >= c.usageLimit;

                let statusLabel = "Đang hoạt động";
                let statusVariant: "default" | "secondary" | "outline" | "destructive" =
                  "default";
                if (!c.isActive) {
                  statusLabel = "Tắt";
                  statusVariant = "secondary";
                } else if (expired) {
                  statusLabel = "Hết hạn";
                  statusVariant = "destructive";
                } else if (notYet) {
                  statusLabel = "Chưa hiệu lực";
                  statusVariant = "outline";
                } else if (exhausted) {
                  statusLabel = "Hết lượt";
                  statusVariant = "destructive";
                }

                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="font-mono font-bold text-brand-primary hover:underline"
                      >
                        {c.code}
                      </Link>
                      {c.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {c.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.type === "PERCENT" ? "accent" : "secondary"}
                        className="rounded-full text-[10px]"
                      >
                        {c.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {c.type === "PERCENT"
                        ? `${Number(c.value)}%`
                        : formatCurrency(Number(c.value))}
                      {c.minOrderValue && (
                        <p className="text-[10px] font-normal text-muted-foreground">
                          từ {formatCurrency(Number(c.minOrderValue))}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-right text-sm tabular-nums md:table-cell">
                      {c.usedCount} / {c.usageLimit ?? "∞"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      <p>{formatDate(c.validFrom)}</p>
                      <p>đến {formatDate(c.validTo)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant} className="rounded-full text-[10px]">
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminCouponRowActions
                        id={c.id}
                        code={c.code}
                        isActive={c.isActive}
                        usedCount={c.usedCount}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildPageUrl={buildPageUrl}
          />
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
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
import { DeleteServiceAction } from "@/components/admin/DeleteServiceAction";

export const metadata: Metadata = { title: "Dịch vụ" };

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; page?: string };

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.ServiceWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
    ];
  }

  const [services, total] = await Promise.all([
    db.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
    }),
    db.service.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/services?${qs}` : "/admin/services";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dịch vụ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CRUD dịch vụ kỹ thuật + quy trình thực hiện.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/admin/services/new">
            <Plus className="h-4 w-4" /> Thêm dịch vụ
          </Link>
        </Button>
      </div>

      <form action="/admin/services" method="get" className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc mô tả ngắn..."
        />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Chưa có dịch vụ nào."
          : `Hiển thị ${skip + 1}–${skip + services.length} trên tổng ${total}`}
      </p>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <Briefcase className="h-8 w-8" />
          Chưa có dịch vụ. Bấm <strong>Thêm dịch vụ</strong> để tạo mới.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead className="hidden md:table-cell">Icon</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden text-xs lg:table-cell">Tạo</TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {s.title}
                    </Link>
                    {s.shortDescription && (
                      <p className="truncate text-xs text-muted-foreground">
                        {s.shortDescription}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {s.icon || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {s.price ? formatCurrency(Number(s.price)) : (
                      <span className="text-xs text-muted-foreground">Liên hệ</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {s.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.isActive ? "default" : "secondary"}
                      className="rounded-full text-[10px]"
                    >
                      {s.isActive ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteServiceAction
                      id={s.id}
                      title={s.title}
                      slug={s.slug}
                    />
                  </TableCell>
                </TableRow>
              ))}
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

import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
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
import { DeleteCategoryAction } from "@/components/admin/DeleteCategoryAction";

export const metadata: Metadata = { title: "Danh mục" };

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; page?: string };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.CategoryWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [categories, total] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
      include: {
        parent: { select: { name: true } },
        _count: { select: { products: true } },
      },
    }),
    db.category.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/categories?${qs}` : "/admin/categories";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Danh mục sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CRUD danh mục: tên, slug, cây phân cấp, ảnh, sắp xếp, ẩn/hiện.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" /> Thêm danh mục
          </Link>
        </Button>
      </div>

      <form action="/admin/categories" method="get" className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc slug..."
        />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Chưa có danh mục nào."
          : `Hiển thị ${skip + 1}–${skip + categories.length} trên tổng ${total}`}
      </p>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <FolderTree className="h-8 w-8" />
          Chưa có danh mục. Bấm <strong>Thêm danh mục</strong> để tạo mới.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead className="hidden md:table-cell">Danh mục cha</TableHead>
                <TableHead className="text-right">Sản phẩm</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden text-xs lg:table-cell">Tạo</TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {c.name}
                    </Link>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {c.slug}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {c.parent?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {c._count.products}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {c.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.isActive ? "default" : "secondary"}
                      className="rounded-full text-[10px]"
                    >
                      {c.isActive ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteCategoryAction id={c.id} name={c.name} />
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

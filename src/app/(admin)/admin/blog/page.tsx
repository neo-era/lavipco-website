import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Newspaper } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ADMIN_TABLE_PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/Pagination";
import { DeleteBlogPostAction } from "@/components/admin/DeleteBlogPostAction";

export const metadata: Metadata = { title: "Tin tức" };

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; status?: string; page?: string };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status =
    sp.status === "PUBLISHED" ? "PUBLISHED" : sp.status === "DRAFT" ? "DRAFT" : "ALL";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.BlogPostWhereInput = {};
  if (status === "PUBLISHED") where.isPublished = true;
  if (status === "DRAFT") where.isPublished = false;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { tags: { hasSome: [q] } },
    ];
  }

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
      include: { author: { select: { name: true, email: true } } },
    }),
    db.blogPost.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/blog?${qs}` : "/admin/blog";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Tin tức</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CRUD bài viết với rich editor (Tiptap) + tags + lịch publish.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" /> Thêm bài viết
          </Link>
        </Button>
      </div>

      <form action="/admin/blog" method="get" className="flex flex-wrap gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tiêu đề, tóm tắt, tag..."
          className="min-w-[240px] flex-1"
        />
        <Select name="status" defaultValue={status}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
            <SelectItem value="DRAFT">Nháp</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">
          Lọc
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Chưa có bài viết nào."
          : `Hiển thị ${skip + 1}–${skip + posts.length} trên tổng ${total}`}
      </p>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <Newspaper className="h-8 w-8" />
          Chưa có bài viết. Bấm <strong>Thêm bài viết</strong> để tạo mới.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ảnh</TableHead>
                <TableHead>Bài viết</TableHead>
                <TableHead className="hidden md:table-cell">Tags</TableHead>
                <TableHead className="hidden lg:table-cell">Tác giả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden text-xs xl:table-cell">Đăng</TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.coverImage ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <Newspaper className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {p.title}
                    </Link>
                    {p.excerpt && (
                      <p className="truncate text-xs text-muted-foreground">
                        {p.excerpt}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                      {p.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {p.author?.name || p.author?.email || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.isPublished ? "default" : "secondary"}
                      className="rounded-full text-[10px]"
                    >
                      {p.isPublished ? "Đã đăng" : "Nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                    {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteBlogPostAction
                      id={p.id}
                      title={p.title}
                      slug={p.slug}
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

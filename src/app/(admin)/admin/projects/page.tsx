import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, FolderOpen, Star } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ADMIN_TABLE_PAGE_SIZE } from "@/lib/constants";
import { PROJECT_CATEGORY_LABELS } from "@/lib/validations/admin-project";
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
import { DeleteProjectAction } from "@/components/admin/DeleteProjectAction";
import { ImportDialog } from "@/components/admin/shared/ImportDialog";
import { previewImportProject, runImportProject } from "@/lib/actions/admin-project-import";

export const metadata: Metadata = { title: "Dự án" };

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; page?: string };

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.ProjectWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { client: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
    }),
    db.project.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dự án</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý portfolio dự án LAVIPCO.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportDialog
            entityLabel="Dự án"
            templateHref="/api/admin/templates/projects"
            onParse={previewImportProject}
            onConfirm={runImportProject}
          />
          <Button asChild variant="brand">
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4" /> Thêm dự án
            </Link>
          </Button>
        </div>
      </div>

      <form action="/admin/projects" method="get" className="flex gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tiêu đề, chủ đầu tư, địa điểm..."
        />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Chưa có dự án nào."
          : `Hiển thị ${skip + 1}–${skip + projects.length} trên tổng ${total}`}
      </p>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <FolderOpen className="h-8 w-8" />
          Chưa có dự án. Bấm <strong>Thêm dự án</strong> để tạo mới.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ảnh</TableHead>
                <TableHead>Dự án</TableHead>
                <TableHead className="hidden md:table-cell">Danh mục</TableHead>
                <TableHead className="hidden lg:table-cell">Chủ đầu tư</TableHead>
                <TableHead className="hidden xl:table-cell">Năm</TableHead>
                <TableHead className="text-right">Thứ tự</TableHead>
                <TableHead className="hidden text-xs lg:table-cell">Tạo</TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.images[0] ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {p.title}
                      {p.isFeatured && (
                        <Star className="ml-1 inline-block h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      )}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.location || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {PROJECT_CATEGORY_LABELS[p.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {p.client || "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm xl:table-cell">
                    {p.year || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {p.sortOrder}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(p.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteProjectAction
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

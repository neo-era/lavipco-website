import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
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

export const metadata: Metadata = { title: "Người dùng nội bộ" };

export const dynamic = "force-dynamic";

type SearchParams = { q?: string };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const where: Prisma.UserWhereInput = {
    role: { in: ["STAFF", "ADMIN"] },
  };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await db.user.findMany({
    where,
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isLocked: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Người dùng nội bộ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tài khoản STAFF/ADMIN. Quản lý vai trò, mật khẩu, khoá ở trang chi
            tiết. Khách hàng (USER) xem ở{" "}
            <Link href="/admin/customers" className="text-brand-primary hover:underline">
              Khách hàng
            </Link>
            .
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4" /> Thêm tài khoản nội bộ
          </Link>
        </Button>
      </div>

      <form action="/admin/users" method="get" className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="Tìm theo tên hoặc email..." />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <ShieldCheck className="h-8 w-8" />
          Chưa có tài khoản nội bộ. Bấm <strong>Thêm tài khoản nội bộ</strong> để tạo.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài khoản</TableHead>
                <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden text-xs lg:table-cell">Tạo</TableHead>
                <TableHead className="w-[120px] text-right">Quản lý</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link
                      href={`/admin/customers/${u.id}`}
                      className="font-medium hover:text-brand-primary"
                    >
                      {u.name || "(Chưa có tên)"}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    {u.isLocked && (
                      <Badge
                        variant="destructive"
                        className="mt-1 rounded-full text-[10px]"
                      >
                        <Lock className="mr-1 h-2.5 w-2.5" />
                        Khoá
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs lg:table-cell">
                    {u.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "ADMIN" ? "brand" : "accent"}
                      className="rounded-full text-[10px]"
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/customers/${u.id}`}>
                        Quản lý <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

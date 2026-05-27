import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, Users } from "lucide-react";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/common/Pagination";

export const metadata: Metadata = { title: "Khách hàng" };

export const dynamic = "force-dynamic";

const VALID_ROLES = ["USER", "STAFF", "ADMIN"] as const;

type SearchParams = {
  q?: string;
  role?: string;
  locked?: string;
  page?: string;
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const role =
    sp.role && (VALID_ROLES as readonly string[]).includes(sp.role)
      ? sp.role
      : "ALL";
  const locked = sp.locked === "YES" ? "YES" : sp.locked === "NO" ? "NO" : "ALL";
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.UserWhereInput = {};
  if (role !== "ALL") where.role = role as (typeof VALID_ROLES)[number];
  if (locked === "YES") where.isLocked = true;
  if (locked === "NO") where.isLocked = false;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { tags: { hasSome: [q] } },
    ];
  }

  const [users, total, totalLocked] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        tags: true,
        isLocked: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    db.user.count({ where }),
    db.user.count({ where: { isLocked: true } }),
  ]);

  // Tính total chi tiêu (sum order.total) cho mỗi user trong batch — 1 query group by
  const userIds = users.map((u) => u.id);
  const spentMap = new Map<string, number>();
  if (userIds.length > 0) {
    const aggregates = await db.order.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
    });
    for (const a of aggregates) {
      if (a.userId) spentMap.set(a.userId, Number(a._sum.total ?? 0));
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "ALL") params.set("role", role);
    if (locked !== "ALL") params.set("locked", locked);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/customers?${qs}` : "/admin/customers";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Khách hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý user/staff/admin: tag, khoá tài khoản, lịch sử đơn hàng.
          {totalLocked > 0 && (
            <span className="ml-2 font-medium text-destructive">
              {totalLocked} tài khoản đang khoá.
            </span>
          )}
        </p>
      </div>

      {/* Filter form */}
      <form
        action="/admin/customers"
        method="get"
        className="flex flex-wrap gap-2 rounded-lg border bg-card p-3"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên, email, SĐT, tag..."
          className="min-w-[240px] flex-1"
        />
        <Select name="role" defaultValue={role}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi vai trò</SelectItem>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="STAFF">STAFF</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
        <Select name="locked" defaultValue={locked}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Khoá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi trạng thái</SelectItem>
            <SelectItem value="YES">Đang khoá</SelectItem>
            <SelectItem value="NO">Không khoá</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="brand">
          Lọc
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Không tìm thấy khách phù hợp."
          : `Hiển thị ${skip + 1}–${skip + users.length} trên tổng ${total} khách`}
      </p>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          <Users className="h-8 w-8" />
          Chưa có khách phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">Tag</TableHead>
                <TableHead className="text-right">Đơn</TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Chi tiêu
                </TableHead>
                <TableHead className="hidden text-xs lg:table-cell">
                  Đăng ký
                </TableHead>
                <TableHead className="w-[60px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const spent = spentMap.get(u.id) ?? 0;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link
                        href={`/admin/customers/${u.id}`}
                        className="font-medium hover:text-brand-primary"
                      >
                        {u.name || "(Chưa có tên)"}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
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
                        variant={
                          u.role === "ADMIN"
                            ? "brand"
                            : u.role === "STAFF"
                              ? "accent"
                              : "secondary"
                        }
                        className="rounded-full text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          u.tags.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {t}
                            </Badge>
                          ))
                        )}
                        {u.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{u.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u._count.orders}
                    </TableCell>
                    <TableCell className="hidden text-right font-semibold tabular-nums text-brand-primary xl:table-cell">
                      {spent > 0 ? formatCurrency(spent) : "—"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/customers/${u.id}`}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
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

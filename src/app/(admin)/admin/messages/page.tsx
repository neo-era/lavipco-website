import type { Metadata } from "next";
import { Prisma, type ContactStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { ADMIN_TABLE_PAGE_SIZE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/Pagination";
import { AdminMessageList } from "@/components/admin/AdminMessageList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Tin nhắn liên hệ" };

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["NEW", "READ", "REPLIED", "CLOSED"] as const;

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status =
    sp.status && (VALID_STATUSES as readonly string[]).includes(sp.status)
      ? (sp.status as ContactStatus)
      : null;
  const page = Math.max(1, Number(sp.page) || 1);
  const skip = (page - 1) * ADMIN_TABLE_PAGE_SIZE;

  const where: Prisma.ContactMessageWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { subject: { contains: q, mode: "insensitive" } },
    ];
  }

  const [messages, total, newCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_TABLE_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TABLE_PAGE_SIZE));
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Tin nhắn liên hệ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tin nhắn từ form liên hệ + báo giá.{" "}
          {newCount > 0 && (
            <span className="font-medium text-brand-accent">
              {newCount} tin mới chưa đọc.
            </span>
          )}
        </p>
      </div>

      {/* Filter form (server-rendered, dùng GET để giữ state qua URL) */}
      <form
        action="/admin/messages"
        method="get"
        className="flex flex-wrap gap-2 rounded-lg border bg-card p-3"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm tên, email, SĐT, tiêu đề..."
          className="min-w-[240px] flex-1"
        />
        <Select name="status" defaultValue={status ?? "ALL"}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="NEW">Mới</SelectItem>
            <SelectItem value="READ">Đã đọc</SelectItem>
            <SelectItem value="REPLIED">Đã trả lời</SelectItem>
            <SelectItem value="CLOSED">Đã đóng</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="brand">
          Lọc
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Không có tin nhắn nào phù hợp."
          : `Hiển thị ${skip + 1}–${skip + messages.length} trên tổng ${total} tin`}
      </p>

      <AdminMessageList messages={messages} />

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

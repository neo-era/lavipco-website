"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

import { ORDER_STATUS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

/**
 * Filter trạng thái + search mã đơn cho /account/orders.
 * State lưu trong URL searchParams; client component dispatch router.push.
 */
export function OrdersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const currentStatus = (searchParams.get("status") ?? "all") as OrderStatus | "all";
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = React.useState(initialQuery);

  function buildUrl(overrides: { status?: string; q?: string }) {
    const params = new URLSearchParams();
    const status = overrides.status ?? currentStatus;
    const q = overrides.q ?? query;
    if (status && status !== "all") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/account/orders?${qs}` : "/account/orders";
  }

  function handleStatus(value: string) {
    startTransition(() => router.push(buildUrl({ status: value })));
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    startTransition(() => router.push(buildUrl({ q: query })));
  }

  function reset() {
    setQuery("");
    startTransition(() => router.push("/account/orders"));
  }

  const hasFilter = currentStatus !== "all" || initialQuery !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={currentStatus} onValueChange={handleStatus} disabled={isPending}>
        <SelectTrigger className="h-9 w-48 text-sm">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <form onSubmit={handleSearch} className="flex flex-1 gap-2 sm:max-w-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo mã đơn DH..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          Tìm
        </Button>
      </form>

      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          Xoá filter
        </Button>
      )}
    </div>
  );
}

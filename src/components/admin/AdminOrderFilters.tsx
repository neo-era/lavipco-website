"use client";

/**
 * Filter bar cho /admin/orders:
 *  - Search: code/email/phone
 *  - Order status, payment status, shipping status, payment method
 *  - Date range (DateRangePicker)
 *
 * Đồng bộ URL searchParams + reset page khi đổi filter.
 */
import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";

type Props = {
  initial: {
    q: string;
    orderStatus: string;
    paymentStatus: string;
    shippingStatus: string;
    paymentMethod: string;
    from: string;
    to: string;
  };
};

export function AdminOrderFilters({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(initial.q);

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setRange(range: DateRange | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set("from", range.from.toISOString().slice(0, 10));
    } else {
      params.delete("from");
    }
    if (range?.to) {
      params.set("to", range.to.toISOString().slice(0, 10));
    } else {
      params.delete("to");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (q !== initial.q) setParam("q", q.trim() || null);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const rangeValue: DateRange | undefined =
    initial.from || initial.to
      ? {
          from: initial.from ? new Date(initial.from) : undefined,
          to: initial.to ? new Date(initial.to) : undefined,
        }
      : undefined;

  function clearAll() {
    router.replace(pathname, { scroll: false });
    setQ("");
  }

  const hasFilters =
    initial.q ||
    initial.orderStatus !== "ALL" ||
    initial.paymentStatus !== "ALL" ||
    initial.shippingStatus !== "ALL" ||
    initial.paymentMethod !== "ALL" ||
    initial.from ||
    initial.to;

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm mã đơn, email, SĐT..."
            className="pl-9"
          />
        </div>

        <DateRangePicker value={rangeValue} onChange={setRange} />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-4 w-4" />
            Xoá tất cả
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={initial.orderStatus}
          onValueChange={(v) => setParam("orderStatus", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái đơn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
            <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={initial.paymentStatus}
          onValueChange={(v) => setParam("paymentStatus", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Thanh toán" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi thanh toán</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={initial.shippingStatus}
          onValueChange={(v) => setParam("shippingStatus", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vận chuyển" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi vận chuyển</SelectItem>
            <SelectItem value="PENDING">Chờ lấy hàng</SelectItem>
            <SelectItem value="PROCESSING">Đang chuẩn bị</SelectItem>
            <SelectItem value="SHIPPED">Đang giao</SelectItem>
            <SelectItem value="DELIVERED">Đã giao</SelectItem>
            <SelectItem value="RETURNED">Đã trả hàng</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={initial.paymentMethod}
          onValueChange={(v) => setParam("paymentMethod", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Phương thức TT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi phương thức</SelectItem>
            <SelectItem value="COD">COD</SelectItem>
            <SelectItem value="VNPAY">VNPay</SelectItem>
            <SelectItem value="MOMO">MoMo</SelectItem>
            <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
            <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

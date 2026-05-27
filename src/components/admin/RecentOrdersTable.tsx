import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Order } from "@prisma/client";

import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RecentOrder = Pick<
  Order,
  "code" | "createdAt" | "total" | "orderStatus" | "paymentStatus"
> & {
  customerLabel: string;
};

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        <ShoppingBag className="h-5 w-5" />
        Chưa có đơn hàng nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead className="hidden md:table-cell">Khách</TableHead>
            <TableHead className="hidden lg:table-cell">Thời gian</TableHead>
            <TableHead>Tổng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="hidden xl:table-cell">Thanh toán</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusMeta = ORDER_STATUS[order.orderStatus];
            const paymentMeta = PAYMENT_STATUS[order.paymentStatus];
            return (
              <TableRow key={order.code}>
                <TableCell>
                  <Link
                    href={`/admin/orders/${order.code}`}
                    className="font-mono text-sm font-bold text-brand-primary hover:underline"
                  >
                    {order.code}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  {order.customerLabel}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell className="font-semibold tabular-nums">
                  {formatCurrency(Number(order.total))}
                </TableCell>
                <TableCell>
                  <Badge variant={statusMeta.variant} className="rounded-full text-[10px]">
                    {statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Badge variant={paymentMeta.variant} className="rounded-full text-[10px]">
                    {paymentMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/orders/${order.code}`}>
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
  );
}

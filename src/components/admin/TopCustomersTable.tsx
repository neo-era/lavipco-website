import { Users } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TopCustomerRow = {
  /** Tên hoặc email user. Guest order sẽ skip. */
  identifier: string;
  email: string | null;
  totalSpent: number;
  orderCount: number;
};

export function TopCustomersTable({ rows }: { rows: TopCustomerRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        <Users className="h-5 w-5" />
        Chưa có khách hàng nào hoàn tất đơn.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead className="text-right">Số đơn</TableHead>
            <TableHead className="text-right">Tổng chi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={`${row.identifier}-${idx}`}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              <TableCell>
                <p className="font-medium">{row.identifier}</p>
                {row.email && (
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.orderCount}</TableCell>
              <TableCell className="text-right font-semibold text-brand-primary tabular-nums">
                {formatCurrency(row.totalSpent)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

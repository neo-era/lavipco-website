import Link from "next/link";
import { Package } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TopProductRow = {
  productSlug: string;
  productName: string;
  variantName: string | null;
  quantitySold: number;
  revenue: number;
};

export function TopProductsTable({ rows }: { rows: TopProductRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        <Package className="h-5 w-5" />
        Chưa có đơn hàng PAID nào tháng này.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-right">SL bán</TableHead>
            <TableHead className="text-right">Doanh thu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={`${row.productSlug}-${row.variantName ?? ""}`}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              <TableCell>
                <Link
                  href={`/products/${row.productSlug}`}
                  className="font-medium hover:text-brand-primary"
                >
                  {row.productName}
                </Link>
                {row.variantName && (
                  <p className="text-xs text-muted-foreground">{row.variantName}</p>
                )}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {row.quantitySold}
              </TableCell>
              <TableCell className="text-right font-semibold text-brand-primary tabular-nums">
                {formatCurrency(row.revenue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

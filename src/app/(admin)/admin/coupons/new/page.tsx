import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { CouponInput } from "@/lib/validations/admin-coupon";
import { Button } from "@/components/ui/button";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";

export const metadata: Metadata = { title: "Thêm mã giảm giá" };

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export default function NewCouponPage() {
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const defaultValues: CouponInput = {
    code: "",
    description: "",
    type: "PERCENT",
    value: 10,
    minOrderValue: null,
    validFrom: toDatetimeLocal(now),
    validTo: toDatetimeLocal(oneMonthLater),
    usageLimit: null,
    isActive: true,
  };

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/coupons">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm mã giảm giá</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo mã PERCENT (giảm %) hoặc FIXED (giảm số tiền cố định).
        </p>
      </div>

      <AdminCouponForm mode="create" defaultValues={defaultValues} />
    </div>
  );
}

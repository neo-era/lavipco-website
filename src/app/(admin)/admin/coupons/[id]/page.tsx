import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { db } from "@/lib/db";
import type { CouponInput } from "@/lib/validations/admin-coupon";
import { Button } from "@/components/ui/button";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";

export const metadata: Metadata = { title: "Sửa mã giảm giá" };

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

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  const defaultValues: CouponInput = {
    code: coupon.code,
    description: coupon.description ?? "",
    type: coupon.type,
    value: Number(coupon.value),
    minOrderValue:
      coupon.minOrderValue !== null ? Number(coupon.minOrderValue) : null,
    validFrom: toDatetimeLocal(coupon.validFrom),
    validTo: toDatetimeLocal(coupon.validTo),
    usageLimit: coupon.usageLimit,
    isActive: coupon.isActive,
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
        <h1 className="font-mono text-2xl font-bold md:text-3xl">{coupon.code}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Đã dùng <strong>{coupon.usedCount}</strong> lần
          {coupon.usageLimit !== null && ` / ${coupon.usageLimit} giới hạn`}
        </p>
      </div>

      <AdminCouponForm
        mode="edit"
        couponId={coupon.id}
        defaultValues={defaultValues}
        usedCount={coupon.usedCount}
      />
    </div>
  );
}

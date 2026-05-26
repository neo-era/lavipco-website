import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Empty state khi giỏ trống — ảnh icon + text + CTA.
 */
export function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card py-16 px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShoppingBag className="h-12 w-12" />
      </div>
      <h2 className="text-xl font-bold">Giỏ hàng trống</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Hãy khám phá catalog sản phẩm LAVIPCO để chọn thiết bị phù hợp cho dự án
        của bạn.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="lg" variant="brand">
          <Link href="/products">
            Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Yêu cầu báo giá</Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, RotateCcw, MessageCircle, Loader2 } from "lucide-react";

import { reorderItems } from "@/lib/actions/account";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

/**
 * 3 action ở trang chi tiết đơn:
 *  - In hoá đơn: window.print() (CSS @media print ẩn UI thừa)
 *  - Đặt lại: gọi reorderItems server → thêm vào CartStore → /cart
 *  - Liên hệ hỗ trợ: link /contact
 */
export function OrderActions({ orderCode }: { orderCode: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [reordering, setReordering] = React.useState(false);

  function handlePrint() {
    window.print();
  }

  async function handleReorder() {
    setReordering(true);
    const result = await reorderItems(orderCode);
    setReordering(false);

    if (!result.ok) {
      toast({
        title: "Không đặt lại được",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    // Add từng item vào cart store
    const addItem = useCartStore.getState().addItem;
    for (const item of result.items) {
      addItem({
        productVariantId: item.productVariantId,
        productSlug: item.productSlug,
        productName: item.productName,
        variantName: item.variantName,
        unitPrice: item.unitPrice,
        maxStock: item.maxStock,
        image: item.image ?? undefined,
        quantity: item.quantity,
      });
    }

    if (result.unavailable.length > 0) {
      toast({
        title: `Đã thêm ${result.items.length} sản phẩm, ${result.unavailable.length} không khả dụng`,
        description: result.unavailable
          .map((u) => `${u.productName}: ${u.reason}`)
          .join("; "),
      });
    } else {
      toast({
        title: "✓ Đã thêm sản phẩm vào giỏ",
        description: `${result.items.length} sản phẩm sẵn sàng thanh toán.`,
      });
    }

    router.push("/cart");
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="brand" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        In hoá đơn
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleReorder}
        disabled={reordering}
      >
        {reordering ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Đặt lại
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href="/contact">
          <MessageCircle className="h-4 w-4" />
          Liên hệ hỗ trợ
        </Link>
      </Button>
    </div>
  );
}

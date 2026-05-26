"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartCount } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Icon giỏ hàng cho Header — kết nối Zustand store.
 * Hiện count luôn = 0 (store placeholder). Phase 4 sẽ có dữ liệu thật.
 */
export function CartIcon({ className }: { className?: string }) {
  const count = useCartCount();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={count > 0 ? `Giỏ hàng (${count} sản phẩm)` : "Giỏ hàng"}
    >
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <Badge
            variant="accent"
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-background px-1 text-[10px] font-bold leading-none"
          >
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

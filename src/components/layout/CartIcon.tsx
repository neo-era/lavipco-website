"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartTotalItems } from "@/store/cart";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Icon giỏ hàng cho Header — kết nối Zustand store.
 * Cart store dùng `skipHydration: true` để tránh SSR/CSR mismatch nên
 * badge chỉ render sau khi `useHasHydrated()` trả true.
 */
export function CartIcon({ className }: { className?: string }) {
  const hydrated = useHasHydrated();
  const count = useCartTotalItems();
  const displayCount = hydrated ? count : 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={displayCount > 0 ? `Giỏ hàng (${displayCount} sản phẩm)` : "Giỏ hàng"}
    >
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {displayCount > 0 && (
          <Badge
            variant="accent"
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border-2 border-background px-1 text-[10px] font-bold leading-none"
          >
            {displayCount > 99 ? "99+" : displayCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

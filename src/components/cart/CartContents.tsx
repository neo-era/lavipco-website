"use client";

import { useCartStore } from "@/store/cart";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

/**
 * Contents của /cart - client component vì đọc Zustand store.
 *
 * Hydration: chờ `useHasHydrated()` trả true trước khi render thật (items
 * persist trong localStorage chỉ available sau client mount). Trước đó render
 * skeleton để tránh layout shift.
 */
export function CartContents() {
  const hydrated = useHasHydrated();
  const items = useCartStore((s) => s.items);

  if (!hydrated) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <CartSummary />
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[96px_1fr] sm:gap-5"
          >
            <div className="aspect-square w-24 animate-pulse rounded-md bg-muted sm:w-full" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted/60" />
              <div className="mt-4 h-8 w-32 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}

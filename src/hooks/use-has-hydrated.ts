"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "@/store/cart";

/**
 * Hook check Zustand persist đã rehydrate xong chưa.
 *
 * Cart store dùng `skipHydration: true` → store ban đầu là default state
 * (`items: []`), client mount sẽ rehydrate manually qua hook này. Component
 * dùng cart phải render fallback (skeleton hoặc "—") trước khi hydrate xong,
 * tránh layout shift sau khi localStorage được đọc.
 *
 * @example
 *   const hydrated = useHasHydrated();
 *   const count = useCartCount();
 *   return <span>{hydrated ? count : "—"}</span>;
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Đăng ký finish hook (Zustand persist event)
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    // Trigger rehydrate; nếu đã hydrate trước đó (HMR), set ngay
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      useCartStore.persist.rehydrate();
    }
    return unsub;
  }, []);

  return hydrated;
}

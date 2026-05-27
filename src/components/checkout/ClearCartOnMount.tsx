"use client";

import { useEffect } from "react";

import { useCartStore } from "@/store/cart";

/**
 * Mount once: clear cart store. Dùng ở /checkout/success để đảm bảo
 * giỏ rỗng sau khi đặt hàng thành công (kể cả khi user refresh).
 */
export function ClearCartOnMount() {
  useEffect(() => {
    useCartStore.getState().clear();
  }, []);
  return null;
}

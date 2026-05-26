/**
 * Cart store (Zustand) - placeholder cho Phase 4 (Giỏ hàng & Checkout).
 *
 * Hiện chỉ expose state rỗng và selector đếm số lượng. Phase 4 sẽ bổ sung:
 *  - addItem(variant, quantity)
 *  - updateQuantity(itemId, quantity)
 *  - removeItem(itemId)
 *  - clear()
 *  - subtotal() selector
 *  - persist middleware (localStorage)
 *
 * Vì cart ở giai đoạn này luôn rỗng, badge giỏ hàng sẽ không hiển thị.
 */
import { create } from "zustand";

export type CartItem = {
  id: string; // = productVariantId
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
};

export const useCartStore = create<CartState>(() => ({
  items: [],
}));

/** Tổng số lượng items trong giỏ — dùng cho badge. */
export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

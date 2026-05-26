/**
 * Cart store (Zustand) với persist localStorage.
 *
 * Phase 4 (Checkout) sẽ:
 *  - Sync với DB khi user login (qua API /api/cart/sync)
 *  - Validate stock thực tế trước khi checkout
 *  - Render trang /cart và /checkout đầy đủ
 *
 * Hiện đã đủ cho "Thêm vào giỏ" ở trang sản phẩm + badge ở Header.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

type CartActions = {
  /**
   * Thêm 1 item; nếu cùng variant đã có, cộng quantity.
   * `id` được tự set bằng `productVariantId`, caller không cần truyền.
   */
  addItem: (
    input: Omit<CartItem, "id" | "quantity"> & { quantity?: number },
  ) => void;
  updateQuantity: (productVariantId: string, quantity: number) => void;
  removeItem: (productVariantId: string) => void;
  clear: () => void;
};

const MAX_QUANTITY = 99;

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],

      addItem: (input) =>
        set((state) => {
          const addQty = input.quantity ?? 1;
          const existing = state.items.find(
            (i) => i.productVariantId === input.productVariantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productVariantId === input.productVariantId
                  ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + addQty) }
                  : i,
              ),
            };
          }
          const newItem: CartItem = {
            ...input,
            id: input.productVariantId,
            quantity: Math.min(MAX_QUANTITY, addQty),
          };
          return { items: [...state.items, newItem] };
        }),

      updateQuantity: (productVariantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productVariantId === productVariantId
                ? { ...i, quantity: Math.max(0, Math.min(MAX_QUANTITY, quantity)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      removeItem: (productVariantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productVariantId !== productVariantId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "lavipco-cart",
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist items, không persist actions (mặc định Zustand handle đúng)
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Tổng số lượng items trong giỏ — dùng cho badge. */
export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

/** Tổng tiền (tính tổng đơn giản, chưa áp coupon/shipping). */
export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

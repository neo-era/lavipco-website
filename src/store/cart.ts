/**
 * Cart store (Zustand) với persist localStorage.
 *
 * Hydration:
 *  - `skipHydration: true` → store KHÔNG tự rehydrate từ localStorage on
 *    initial render → tránh SSR/CSR mismatch.
 *  - Component dùng cart phải gọi `useHasHydrated()` (xem src/hooks/) để
 *    biết khi nào safe đọc state thực; trước đó render fallback (skeleton
 *    hoặc trống).
 *
 * Phase 4 sẽ hoàn thiện:
 *  - Trang /cart UI đầy đủ (prompt 4.1)
 *  - /checkout + Order CRUD (prompt 4.2)
 *  - Sync với DB khi user login (sau)
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { VAT_RATE } from "@/lib/constants";

export type CartItem = {
  id: string; // = productVariantId
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  unitPrice: number; // VAT-included theo CLAUDE.md mục 10
  quantity: number;
  /** Stock tối đa của variant tại thời điểm thêm vào giỏ. Khi update qty
   *  vượt giá trị này, store clamp về maxStock và caller có thể toast warning. */
  maxStock: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
};

type UpdateQuantityResult = {
  applied: number;
  clamped: boolean; // true nếu yêu cầu vượt maxStock và đã clamp
};

type CartActions = {
  /**
   * Thêm 1 item; nếu cùng variant đã có, cộng quantity.
   * `id` tự set bằng `productVariantId`. Clamp tổng quantity về maxStock.
   * @returns object có `clamped: true` nếu quantity bị clamp do maxStock.
   */
  addItem: (
    input: Omit<CartItem, "id" | "quantity"> & { quantity?: number },
  ) => { clamped: boolean };
  updateQuantity: (productVariantId: string, quantity: number) => UpdateQuantityResult;
  removeItem: (productVariantId: string) => void;
  clear: () => void;
};

const MAX_QUANTITY = 99;

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const addQty = input.quantity ?? 1;
        const stockCap = Math.min(MAX_QUANTITY, input.maxStock);
        let clamped = false;

        set((state) => {
          const existing = state.items.find(
            (i) => i.productVariantId === input.productVariantId,
          );
          if (existing) {
            const requested = existing.quantity + addQty;
            const finalQty = Math.min(stockCap, requested);
            if (finalQty < requested) clamped = true;
            return {
              items: state.items.map((i) =>
                i.productVariantId === input.productVariantId
                  ? { ...i, quantity: finalQty, maxStock: input.maxStock }
                  : i,
              ),
            };
          }
          const finalQty = Math.min(stockCap, addQty);
          if (finalQty < addQty) clamped = true;
          const newItem: CartItem = {
            ...input,
            id: input.productVariantId,
            quantity: finalQty,
          };
          return { items: [...state.items, newItem] };
        });

        return { clamped };
      },

      updateQuantity: (productVariantId, quantity) => {
        const existing = get().items.find(
          (i) => i.productVariantId === productVariantId,
        );
        if (!existing) return { applied: 0, clamped: false };

        const stockCap = Math.min(MAX_QUANTITY, existing.maxStock);
        const final = Math.max(0, Math.min(stockCap, quantity));
        const clamped = quantity > stockCap;

        set((state) => ({
          items: state.items
            .map((i) =>
              i.productVariantId === productVariantId ? { ...i, quantity: final } : i,
            )
            .filter((i) => i.quantity > 0),
        }));

        return { applied: final, clamped };
      },

      removeItem: (productVariantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productVariantId !== productVariantId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "lavipco-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Tránh SSR/CSR mismatch - component tự rehydrate qua useHasHydrated()
      skipHydration: true,
    },
  ),
);

// ====================================================================
// Selectors
// ====================================================================

/** Tổng số item (qty) trong giỏ — dùng cho badge. */
export const useCartTotalItems = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

/** Alias backward-compat. */
export const useCartCount = useCartTotalItems;

/** Tạm tính (đã bao gồm VAT) — tổng `qty * unitPrice` của toàn bộ items. */
export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

/**
 * VAT 10% extract từ subtotal (vì unitPrice đã include VAT).
 *   vatAmount = subtotal × VAT_RATE / (1 + VAT_RATE)
 */
export const useCartVatAmount = () =>
  useCartStore((state) => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return (subtotal * VAT_RATE) / (1 + VAT_RATE);
  });

/**
 * Tổng cộng = subtotal + shippingFee (VAT đã trong subtotal).
 * Cart page truyền shippingFee=0; checkout truyền phí thực tế.
 */
export const useCartTotalAmount = (shippingFee = 0) =>
  useCartStore(
    (state) =>
      state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) +
      shippingFee,
  );

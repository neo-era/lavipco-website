/**
 * Tính phí vận chuyển.
 *
 * Lưu ý: từ 2025 địa chỉ VN dùng cấu trúc 2 cấp (Tỉnh/Thành → Phường/Xã, bỏ
 * Quận/Huyện). GHN hiện vẫn dùng cấu trúc cũ 3 cấp (cần district_id) nên CHƯA
 * map được địa chỉ mới sang GHN → tạm dùng phí phẳng. Khi GHN hỗ trợ cấu trúc
 * mới sẽ tích hợp tính phí realtime trở lại.
 */
import { SHIPPING_DEFAULT_FEE } from "@/lib/constants";

export type ShippingFeeInput = {
  provinceName: string;
  wardName: string;
  /** Tổng khối lượng đơn (gram). */
  weight: number;
  /** Tổng giá trị đơn (VND) - dùng cho insurance value. */
  insuranceValue?: number;
};

export type ShippingFeeResult = {
  fee: number;
  provider: "ghn" | "mock";
  /** True nếu rơi vào phí phẳng (caller có thể show note). */
  isFallback: boolean;
};

export async function calculateShippingFee(
  input: ShippingFeeInput,
): Promise<ShippingFeeResult> {
  // input chưa dùng (đang phí phẳng) — giữ chữ ký để tích hợp GHN khi hỗ trợ cấu trúc mới
  void input;
  return { fee: SHIPPING_DEFAULT_FEE, provider: "mock", isFallback: true };
}

/**
 * Ước lượng khối lượng đơn (gram). Hiện hardcode 1kg/item.
 */
export function estimateOrderWeight(itemCount: number): number {
  const DEFAULT_WEIGHT_PER_ITEM_G = 1000;
  return Math.max(100, itemCount * DEFAULT_WEIGHT_PER_ITEM_G);
}

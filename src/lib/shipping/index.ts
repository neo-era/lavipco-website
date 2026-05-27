/**
 * Wrapper tính phí vận chuyển defensive.
 *
 * Flow:
 *   1. Nếu có GHN_API_TOKEN + GHN_SHOP_ID → lookup district/ward → call GHN fee
 *   2. Nếu fail bất cứ bước nào → fallback mock 30.000 VND + console.warn
 *
 * Caller (createOrder action) gọi function này 1 lần khi user submit checkout,
 * lưu fee vào Order.shippingFee. Không gọi realtime mỗi keystroke (sẽ rate-limit
 * và lag UX).
 */
import { SHIPPING_DEFAULT_FEE } from "@/lib/constants";
import {
  GHN_ENABLED,
  calculateGhnFee,
  lookupGhnDistrictId,
  lookupGhnWardCode,
} from "./ghn";

export type ShippingFeeInput = {
  provinceName: string;
  districtName: string;
  wardName: string;
  /** Tổng khối lượng đơn (gram). Helper `estimateOrderWeight()` từ items. */
  weight: number;
  /** Tổng giá trị đơn (VND) - dùng cho insurance value. */
  insuranceValue?: number;
};

export type ShippingFeeResult = {
  fee: number;
  provider: "ghn" | "mock";
  /** True nếu rơi vào fallback mock (caller có thể show warning). */
  isFallback: boolean;
};

export async function calculateShippingFee(
  input: ShippingFeeInput,
): Promise<ShippingFeeResult> {
  if (!GHN_ENABLED) {
    console.warn(
      "[shipping] GHN_API_TOKEN/SHOP_ID chưa setup, fallback mock fee",
      SHIPPING_DEFAULT_FEE,
    );
    return { fee: SHIPPING_DEFAULT_FEE, provider: "mock", isFallback: true };
  }

  const districtId = await lookupGhnDistrictId(
    input.provinceName,
    input.districtName,
  );
  if (!districtId) {
    return { fee: SHIPPING_DEFAULT_FEE, provider: "mock", isFallback: true };
  }

  const wardCode = await lookupGhnWardCode(districtId, input.wardName);
  if (!wardCode) {
    return { fee: SHIPPING_DEFAULT_FEE, provider: "mock", isFallback: true };
  }

  const ghnResult = await calculateGhnFee({
    toDistrictId: districtId,
    toWardCode: wardCode,
    weight: input.weight,
    insuranceValue: input.insuranceValue,
  });
  if (!ghnResult) {
    return { fee: SHIPPING_DEFAULT_FEE, provider: "mock", isFallback: true };
  }

  return { fee: ghnResult.total, provider: "ghn", isFallback: false };
}

/**
 * Ước lượng khối lượng đơn (gram).
 * Hiện hardcode 1kg/item. Khi schema có Product.weight thật, replace.
 */
export function estimateOrderWeight(itemCount: number): number {
  const DEFAULT_WEIGHT_PER_ITEM_G = 1000;
  return Math.max(100, itemCount * DEFAULT_WEIGHT_PER_ITEM_G);
}

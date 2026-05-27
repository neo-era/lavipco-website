/**
 * GHN API wrapper.
 *
 * Docs: https://docs.ghn.dev/
 * Env cần có:
 *   - GHN_API_TOKEN (header `Token`)
 *   - GHN_SHOP_ID (header `ShopId`)
 *
 * Token sandbox khác production. Endpoint sandbox:
 *   https://online-gateway.ghn.vn/shiip/public-api (cả 2 env)
 *
 * Tất cả call có timeout 10s + try/catch trả null nếu fail. Caller xử lý fallback.
 */
const GHN_BASE = "https://online-gateway.ghn.vn/shiip/public-api";

type GhnHeaders = {
  Token: string;
  ShopId: string;
  "Content-Type": "application/json";
};

function getGhnHeaders(): GhnHeaders | null {
  const token = process.env.GHN_API_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;
  if (!token || !shopId) return null;
  return {
    Token: token,
    ShopId: shopId,
    "Content-Type": "application/json",
  };
}

export const GHN_ENABLED = Boolean(
  process.env.GHN_API_TOKEN && process.env.GHN_SHOP_ID,
);

/**
 * GHN province có DistrictID nội bộ khác với mã hành chính TCVN của VN.
 * Để map "Quận 1, TP.HCM" → GHN DistrictID, ta gọi GHN /master-data
 * và match theo tên.
 */
export type GhnDistrict = {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  NameExtension?: string[]; // alias names, ví dụ ["Quận 1", "Q1"]
};

export type GhnWard = {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension?: string[];
};

/** Lookup GHN DistrictID từ tên huyện + tên tỉnh. Trả null nếu fail. */
export async function lookupGhnDistrictId(
  provinceName: string,
  districtName: string,
): Promise<number | null> {
  const headers = getGhnHeaders();
  if (!headers) return null;

  try {
    const provincesRes = await fetch(`${GHN_BASE}/master-data/province`, {
      headers: { Token: headers.Token },
      signal: AbortSignal.timeout(10_000),
    });
    if (!provincesRes.ok) return null;
    const provinces = (await provincesRes.json()) as {
      data: Array<{ ProvinceID: number; ProvinceName: string; NameExtension?: string[] }>;
    };
    const province = provinces.data.find(
      (p) =>
        p.ProvinceName === provinceName ||
        (p.NameExtension ?? []).includes(provinceName),
    );
    if (!province) return null;

    const districtsRes = await fetch(
      `${GHN_BASE}/master-data/district?province_id=${province.ProvinceID}`,
      {
        headers: { Token: headers.Token },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!districtsRes.ok) return null;
    const districts = (await districtsRes.json()) as { data: GhnDistrict[] };
    const district = districts.data.find(
      (d) =>
        d.DistrictName === districtName ||
        (d.NameExtension ?? []).includes(districtName),
    );
    return district ? district.DistrictID : null;
  } catch (error) {
    console.warn("[ghn] lookupGhnDistrictId fail", error);
    return null;
  }
}

/** Lookup GHN WardCode từ districtId + ward name. */
export async function lookupGhnWardCode(
  districtId: number,
  wardName: string,
): Promise<string | null> {
  const headers = getGhnHeaders();
  if (!headers) return null;

  try {
    const res = await fetch(`${GHN_BASE}/master-data/ward?district_id=${districtId}`, {
      headers: { Token: headers.Token },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data: GhnWard[] };
    const ward = data.data.find(
      (w) =>
        w.WardName === wardName ||
        (w.NameExtension ?? []).includes(wardName),
    );
    return ward ? ward.WardCode : null;
  } catch (error) {
    console.warn("[ghn] lookupGhnWardCode fail", error);
    return null;
  }
}

export type GhnFeeInput = {
  toDistrictId: number;
  toWardCode: string;
  /** Từ DistrictID của LAVIPCO. Lấy từ env GHN_FROM_DISTRICT_ID hoặc default. */
  fromDistrictId?: number;
  /** Tổng khối lượng đơn hàng (gram). Default 1000g/1kg per item. */
  weight: number;
  /** Service type ID: 2 = Standard. */
  serviceTypeId?: number;
  /** Giá trị bảo hiểm (VND), thường = tổng đơn. */
  insuranceValue?: number;
};

export type GhnFeeResult = {
  total: number; // VND
  service_fee: number;
  insurance_fee?: number;
};

/** Tính phí GHN. Trả null nếu fail/không có token. */
export async function calculateGhnFee(input: GhnFeeInput): Promise<GhnFeeResult | null> {
  const headers = getGhnHeaders();
  if (!headers) return null;

  const fromDistrictId =
    input.fromDistrictId ??
    (Number(process.env.GHN_FROM_DISTRICT_ID) || 1454); // default: Quận 1 HCM placeholder

  const body = {
    from_district_id: fromDistrictId,
    service_type_id: input.serviceTypeId ?? 2,
    to_district_id: input.toDistrictId,
    to_ward_code: input.toWardCode,
    weight: Math.max(100, input.weight),
    length: 30,
    width: 20,
    height: 15,
    insurance_value: input.insuranceValue ?? 0,
  };

  try {
    const res = await fetch(`${GHN_BASE}/v2/shipping-order/fee`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn("[ghn] fee API trả lỗi", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { data: GhnFeeResult };
    return data.data;
  } catch (error) {
    console.warn("[ghn] calculateGhnFee fail", error);
    return null;
  }
}

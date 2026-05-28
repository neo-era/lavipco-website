/**
 * Helpers truy vấn dữ liệu hành chính VN (cấu trúc 2 cấp, từ data.ts offline).
 * Dùng cho dropdown cascade Tỉnh/Thành → Phường/Xã ở checkout / form địa chỉ.
 */
import { PROVINCES, WARDS } from "./data";
import type { Province, Ward } from "./types";

export type { Province, Ward };

export function getProvinces(): Province[] {
  return PROVINCES;
}

export function getWards(provinceCode?: string): Ward[] {
  if (!provinceCode) return [];
  return WARDS.filter((w) => w.provinceCode === provinceCode);
}

export function findProvince(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function findWard(code: string): Ward | undefined {
  return WARDS.find((w) => w.code === code);
}

/**
 * Helpers truy vấn dữ liệu hành chính VN (từ data.ts JSON offline).
 * Dùng cho dropdown cascade ở trang checkout / form địa chỉ.
 */
import { PROVINCES, DISTRICTS, WARDS } from "./data";
import type { Province, District, Ward } from "./types";

export type { Province, District, Ward };

export function getProvinces(): Province[] {
  return PROVINCES;
}

export function getDistricts(provinceCode?: string): District[] {
  if (!provinceCode) return [];
  return DISTRICTS.filter((d) => d.provinceCode === provinceCode);
}

export function getWards(districtCode?: string): Ward[] {
  if (!districtCode) return [];
  return WARDS.filter((w) => w.districtCode === districtCode);
}

export function findProvince(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function findDistrict(code: string): District | undefined {
  return DISTRICTS.find((d) => d.code === code);
}

export function findWard(code: string): Ward | undefined {
  return WARDS.find((w) => w.code === code);
}

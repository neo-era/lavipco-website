/**
 * Type cho dữ liệu hành chính Việt Nam (tỉnh / huyện / xã).
 * Code dùng mã hành chính chuẩn TCVN (Tổng cục Thống kê):
 *  - Province: 2 chữ số (ví dụ "79" = TP.HCM, "01" = Hà Nội)
 *  - District: 3 chữ số (ví dụ "760" = Quận 1)
 *  - Ward: 5 chữ số (ví dụ "26734" = Phường Bến Nghé)
 */
export type Province = {
  code: string;
  name: string;
};

export type District = {
  code: string;
  name: string;
  provinceCode: string;
};

export type Ward = {
  code: string;
  name: string;
  districtCode: string;
};

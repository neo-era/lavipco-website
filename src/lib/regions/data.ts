/**
 * Sample data hành chính Việt Nam cho 7 tỉnh phổ biến.
 *
 * TODO PRODUCTION: thay bằng dataset full (63 tỉnh + ~700 huyện + ~11k xã).
 * Tham khảo:
 *   - https://github.com/madnh/hanhchinhvn (open-source, mã chuẩn TCVN)
 *   - https://provinces.open-api.vn (REST API, có thể dump JSON)
 *
 * Hoặc thay bằng GHN provinces API nếu muốn nhất quán với shipping
 * (cùng nguồn ID), nhưng cần GHN_API_TOKEN.
 */
import type { Province, District, Ward } from "./types";

export const PROVINCES: Province[] = [
  { code: "01", name: "Hà Nội" },
  { code: "31", name: "Hải Phòng" },
  { code: "48", name: "Đà Nẵng" },
  { code: "74", name: "Bình Dương" },
  { code: "72", name: "Tây Ninh" },
  { code: "79", name: "TP. Hồ Chí Minh" },
  { code: "92", name: "Cần Thơ" },
];

export const DISTRICTS: District[] = [
  // Hà Nội
  { code: "001", name: "Ba Đình", provinceCode: "01" },
  { code: "002", name: "Hoàn Kiếm", provinceCode: "01" },
  { code: "007", name: "Đống Đa", provinceCode: "01" },
  { code: "008", name: "Hai Bà Trưng", provinceCode: "01" },
  { code: "009", name: "Hoàng Mai", provinceCode: "01" },
  // Hải Phòng
  { code: "303", name: "Hồng Bàng", provinceCode: "31" },
  { code: "304", name: "Ngô Quyền", provinceCode: "31" },
  // Đà Nẵng
  { code: "490", name: "Hải Châu", provinceCode: "48" },
  { code: "491", name: "Thanh Khê", provinceCode: "48" },
  // Bình Dương
  { code: "718", name: "Thủ Dầu Một", provinceCode: "74" },
  { code: "719", name: "Bến Cát", provinceCode: "74" },
  // Tây Ninh
  { code: "703", name: "Tây Ninh", provinceCode: "72" },
  { code: "705", name: "Hòa Thành", provinceCode: "72" },
  { code: "707", name: "Trảng Bàng", provinceCode: "72" },
  // TP.HCM
  { code: "760", name: "Quận 1", provinceCode: "79" },
  { code: "761", name: "Quận 12", provinceCode: "79" },
  { code: "764", name: "Gò Vấp", provinceCode: "79" },
  { code: "765", name: "Bình Thạnh", provinceCode: "79" },
  { code: "766", name: "Tân Bình", provinceCode: "79" },
  { code: "767", name: "Tân Phú", provinceCode: "79" },
  { code: "768", name: "Phú Nhuận", provinceCode: "79" },
  { code: "770", name: "Quận 3", provinceCode: "79" },
  { code: "771", name: "Quận 10", provinceCode: "79" },
  { code: "772", name: "Quận 11", provinceCode: "79" },
  { code: "773", name: "Quận 4", provinceCode: "79" },
  { code: "774", name: "Quận 5", provinceCode: "79" },
  { code: "775", name: "Quận 6", provinceCode: "79" },
  { code: "776", name: "Quận 8", provinceCode: "79" },
  { code: "777", name: "Bình Tân", provinceCode: "79" },
  { code: "778", name: "Quận 7", provinceCode: "79" },
  { code: "783", name: "Thủ Đức", provinceCode: "79" },
  // Cần Thơ
  { code: "916", name: "Ninh Kiều", provinceCode: "92" },
  { code: "917", name: "Ô Môn", provinceCode: "92" },
];

export const WARDS: Ward[] = [
  // Ba Đình - Hà Nội
  { code: "00001", name: "Phúc Xá", districtCode: "001" },
  { code: "00004", name: "Trúc Bạch", districtCode: "001" },
  { code: "00007", name: "Vĩnh Phúc", districtCode: "001" },
  // Hoàn Kiếm
  { code: "00037", name: "Phúc Tân", districtCode: "002" },
  { code: "00040", name: "Đồng Xuân", districtCode: "002" },
  // Đống Đa
  { code: "00229", name: "Cát Linh", districtCode: "007" },
  { code: "00232", name: "Văn Miếu", districtCode: "007" },
  // Hồng Bàng - Hải Phòng
  { code: "11365", name: "Quán Toan", districtCode: "303" },
  { code: "11368", name: "Hùng Vương", districtCode: "303" },
  // Hải Châu - Đà Nẵng
  { code: "20194", name: "Thạch Thang", districtCode: "490" },
  { code: "20195", name: "Hải Châu I", districtCode: "490" },
  // Thủ Dầu Một - Bình Dương
  { code: "25738", name: "Hiệp Thành", districtCode: "718" },
  { code: "25741", name: "Phú Lợi", districtCode: "718" },
  // Tây Ninh
  { code: "25336", name: "Ninh Thạnh", districtCode: "703" },
  { code: "25339", name: "Hiệp Ninh", districtCode: "703" },
  // Quận 1 - TP.HCM
  { code: "26734", name: "Bến Nghé", districtCode: "760" },
  { code: "26737", name: "Bến Thành", districtCode: "760" },
  { code: "26740", name: "Cô Giang", districtCode: "760" },
  { code: "26743", name: "Cầu Kho", districtCode: "760" },
  { code: "26746", name: "Cầu Ông Lãnh", districtCode: "760" },
  // Quận 3
  { code: "26926", name: "Phường 1", districtCode: "770" },
  { code: "26929", name: "Phường 2", districtCode: "770" },
  // Bình Thạnh
  { code: "27322", name: "Phường 13", districtCode: "765" },
  { code: "27325", name: "Phường 11", districtCode: "765" },
  // Ninh Kiều - Cần Thơ
  { code: "31135", name: "Cái Khế", districtCode: "916" },
  { code: "31138", name: "An Hòa", districtCode: "916" },
];

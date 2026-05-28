/**
 * Type cho dữ liệu hành chính Việt Nam — cấu trúc 2 cấp sau sáp nhập 2025.
 * Chỉ còn Tỉnh/Thành và Phường/Xã (không còn Quận/Huyện).
 * Code dùng mã đơn vị hành chính (GSO).
 */
export type Province = {
  code: string;
  name: string;
};

export type Ward = {
  code: string;
  name: string;
  provinceCode: string;
};

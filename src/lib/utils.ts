import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Gộp class Tailwind, ưu tiên class sau và resolve xung đột.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng số tiền VND theo locale Việt Nam, không hiển thị phần thập phân.
 * @example formatCurrency(95628000) // "95.628.000 ₫"
 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Định dạng ngày sang dd/MM/yyyy theo locale tiếng Việt.
 * Chấp nhận Date object hoặc ISO string.
 */
export function formatDate(value: Date | string, pattern = "dd/MM/yyyy"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern, { locale: vi });
}

/**
 * Chuẩn hoá số điện thoại Việt Nam về dạng 0xxxxxxxxx.
 * - Bỏ khoảng trắng, dấu chấm, dấu gạch.
 * - +84 / 84 ở đầu được chuyển thành 0.
 */
export function normalizePhoneVN(input: string): string {
  const digits = input.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+84")) return "0" + digits.slice(3);
  if (digits.startsWith("84") && digits.length >= 10) return "0" + digits.slice(2);
  return digits;
}

/**
 * Tạo slug từ chuỗi tiếng Việt (bỏ dấu, lowercase, dùng dấu gạch).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Sinh mã đơn hàng định dạng DHyyyymmddxxxx (xxxx là số chạy được cấp ngoài).
 */
export function formatOrderCode(date: Date, sequence: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `DH${y}${m}${d}${seq}`;
}

/**
 * Sinh mã báo giá định dạng <seq>/<năm>/LVC-BG, ví dụ 0425/2026/LVC-BG.
 */
export function formatQuotationCode(year: number, sequence: number): string {
  return `${String(sequence).padStart(4, "0")}/${year}/LVC-BG`;
}

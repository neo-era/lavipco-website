/**
 * Hằng số tĩnh của site LAVIPCO.
 * Một số trường (hotline, email, MST, address) sẽ được override từ bảng
 * `Setting` ở database — file này là fallback và dùng cho SEO/metadata build-time.
 *
 * Khi cần dùng phần mềm-only constant (URL endpoint, MST, mã ngân hàng…) hãy
 * giữ ở đây để dễ tra cứu.
 */

import type {
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
  ShippingStatus as PrismaShippingStatus,
  PaymentMethod as PrismaPaymentMethod,
} from "@prisma/client";

// ====================================================================
// Thông tin doanh nghiệp
// ====================================================================

export type SiteConfig = {
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  hotline: string;
  email: string;
  address: string;
  taxCode: string; // MST
  workingHours: string;
  social: {
    facebook: string;
    youtube: string;
    zalo: string;
  };
};

export const SITE_CONFIG: SiteConfig = {
  name: "LAVIPCO",
  fullName: "Công ty TNHH Kỹ Nghệ Lâm Việt Phát",
  tagline: "Giải pháp đèn tín hiệu giao thông & chiếu sáng đô thị thông minh",
  description:
    "LAVIPCO cung cấp thiết bị và giải pháp đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City tại Việt Nam.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  // Để rỗng, Lam điền giá trị thật sau
  hotline: "",
  email: "",
  address: "",
  taxCode: "",
  workingHours: "T2 - T7: 08:00 - 17:30",
  social: {
    facebook: "",
    youtube: "",
    zalo: "",
  },
};

// ====================================================================
// Hằng số nghiệp vụ
// ====================================================================

/** Thuế VAT chuẩn 10% áp dụng cho sản phẩm/dịch vụ. */
export const VAT_RATE = 0.1;

/** Phí giao hàng mặc định khi chưa tích hợp GHN/GHTK (VND). */
export const SHIPPING_DEFAULT_FEE = 30_000;

/** Tổng tiền tối thiểu để FREE SHIP (VND). null = không miễn phí ship. */
export const FREE_SHIPPING_THRESHOLD: number | null = null;

/** Số lượng item tối đa cho một dòng giỏ hàng. */
export const MAX_CART_ITEM_QUANTITY = 99;

/** Số sản phẩm hiển thị mặc định mỗi trang ở danh sách public. */
export const PRODUCTS_PER_PAGE = 12;

/** Số dòng mỗi trang cho table admin (đơn hàng, khách hàng…). */
export const ADMIN_TABLE_PAGE_SIZE = 20;

// ====================================================================
// Status maps — Prisma enum → label tiếng Việt + variant Badge
// Dùng cho UI: render badge trạng thái đơn hàng / thanh toán / giao hàng.
// ====================================================================

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "brand" | "accent";

type StatusMeta = {
  label: string;
  variant: BadgeVariant;
};

export const ORDER_STATUS: Record<PrismaOrderStatus, StatusMeta> = {
  PENDING: { label: "Chờ xử lý", variant: "secondary" },
  CONFIRMED: { label: "Đã xác nhận", variant: "brand" },
  PROCESSING: { label: "Đang xử lý", variant: "accent" },
  COMPLETED: { label: "Hoàn tất", variant: "default" },
  CANCELLED: { label: "Đã huỷ", variant: "destructive" },
};

export const PAYMENT_STATUS: Record<PrismaPaymentStatus, StatusMeta> = {
  PENDING: { label: "Chờ thanh toán", variant: "secondary" },
  PAID: { label: "Đã thanh toán", variant: "default" },
  FAILED: { label: "Thanh toán thất bại", variant: "destructive" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "outline" },
};

export const SHIPPING_STATUS: Record<PrismaShippingStatus, StatusMeta> = {
  PENDING: { label: "Chờ lấy hàng", variant: "secondary" },
  PROCESSING: { label: "Đang chuẩn bị", variant: "accent" },
  SHIPPED: { label: "Đang giao", variant: "brand" },
  DELIVERED: { label: "Đã giao", variant: "default" },
  RETURNED: { label: "Đã trả hàng", variant: "destructive" },
};

export const PAYMENT_METHOD: Record<PrismaPaymentMethod, { label: string }> = {
  COD: { label: "Thanh toán khi nhận hàng (COD)" },
  VNPAY: { label: "VNPay" },
  MOMO: { label: "Ví MoMo" },
  ZALOPAY: { label: "ZaloPay" },
  BANK_TRANSFER: { label: "Chuyển khoản ngân hàng" },
};

// ====================================================================
// Điều hướng (navigation)
// ====================================================================

export const MAIN_NAV = [
  { title: "Trang chủ", href: "/" },
  { title: "Giới thiệu", href: "/about" },
  { title: "Dịch vụ", href: "/services" },
  { title: "Dự án", href: "/projects" },
  { title: "Sản phẩm", href: "/products" },
  { title: "Tin tức", href: "/blog" },
  { title: "Liên hệ", href: "/contact" },
] as const;

export const FOOTER_NAV = {
  quickLinks: [
    { title: "Giới thiệu", href: "/about" },
    { title: "Dịch vụ", href: "/services" },
    { title: "Dự án", href: "/projects" },
    { title: "Sản phẩm", href: "/products" },
    { title: "Tin tức", href: "/blog" },
    { title: "Liên hệ", href: "/contact" },
  ],
  support: [
    { title: "Hướng dẫn mua hàng", href: "/guide" },
    { title: "Câu hỏi thường gặp", href: "/faq" },
    { title: "Chính sách bảo hành", href: "/warranty" },
    { title: "Chính sách đổi trả", href: "/return-policy" },
    { title: "Chính sách bảo mật", href: "/privacy" },
    { title: "Điều khoản sử dụng", href: "/terms" },
  ],
} as const;

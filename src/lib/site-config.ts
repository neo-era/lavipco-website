/**
 * Cấu hình tĩnh của site LAVIPCO.
 * Khi có Admin Settings (Setting model), một số trường ở đây sẽ được override
 * từ database. Giữ ở đây làm fallback và để dùng cho SEO/metadata build-time.
 */
export const siteConfig = {
  name: "LAVIPCO",
  fullName: "Công ty TNHH Kỹ Nghệ Lâm Việt Phát",
  tagline: "Giải pháp đèn tín hiệu giao thông & chiếu sáng đô thị thông minh",
  description:
    "LAVIPCO cung cấp thiết bị và giải pháp đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City tại Việt Nam.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  contact: {
    hotline: "1900 0000",
    email: "info@lavipco.com.vn",
    address: "TP. Hồ Chí Minh, Việt Nam",
    taxCode: "MST: 03xxxxxxxx", // TODO: cập nhật MST thật khi có
    workingHours: "T2 - T7: 08:00 - 17:30",
  },
  social: {
    facebook: "",
    youtube: "",
    zalo: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const mainNav = [
  { title: "Trang chủ", href: "/" },
  { title: "Giới thiệu", href: "/about" },
  { title: "Dịch vụ", href: "/services" },
  { title: "Dự án", href: "/projects" },
  { title: "Sản phẩm", href: "/products" },
  { title: "Tin tức", href: "/blog" },
  { title: "Liên hệ", href: "/contact" },
] as const;

export const footerNav = {
  company: [
    { title: "Giới thiệu", href: "/about" },
    { title: "Dự án đã thực hiện", href: "/projects" },
    { title: "Tin tức", href: "/blog" },
    { title: "Liên hệ", href: "/contact" },
  ],
  services: [
    { title: "Đèn tín hiệu giao thông", href: "/services#traffic-light" },
    { title: "Chiếu sáng đô thị thông minh", href: "/services#smart-lighting" },
    { title: "Chiếu sáng cảnh quan", href: "/services#landscape" },
    { title: "Hạ tầng điện", href: "/services#power-infra" },
  ],
  legal: [
    { title: "Chính sách bảo mật", href: "/privacy" },
    { title: "Điều khoản sử dụng", href: "/terms" },
    { title: "Chính sách đổi trả", href: "/return-policy" },
    { title: "Chính sách bảo hành", href: "/warranty" },
  ],
} as const;

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */

/**
 * Security headers áp dụng cho mọi route.
 *
 * CSP (Content-Security-Policy):
 *  - 'unsafe-inline' cho script/style: Next.js cần cho hydration + Tailwind JIT
 *    + Radix UI runtime style. Đây là trade-off bắt buộc với Next.js App Router.
 *  - 'unsafe-eval' chỉ bật ở dev (HMR cần eval). Production tắt.
 *  - Cloudinary + Unsplash: domain ảnh.
 *  - GA/GTM: domain analytics.
 *  - VNPay: form-action cho phép submit về sandbox/production gateway.
 *
 * HSTS: chỉ bật ở production để tránh khoá HTTPS khi dev local HTTP.
 */

const isProduction = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isProduction ? "" : "'unsafe-eval'"} https://www.googletagmanager.com https://www.google-analytics.com`.trim(),
  "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://api.cloudinary.com https://sandbox.vnpayment.vn https://*.ingest.us.sentry.io",
  "frame-src 'self' https://www.googletagmanager.com",
  "form-action 'self' https://sandbox.vnpayment.vn https://merchant.vnpay.vn",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  // Chặn clickjacking - không cho site khác iframe nhúng
  { key: "X-Frame-Options", value: "DENY" },
  // Browser không tự đoán MIME → tránh execute JS từ file ảnh
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referer chỉ gửi origin với cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Tắt các browser feature nhạy cảm
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig = {
  // Cần cho src/instrumentation.ts (nạp Sentry server/edge) ở Next 14
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Powered-by header lộ tech stack → tắt
  poweredByHeader: false,
};

/**
 * Bọc Sentry. Không có SENTRY_ORG/PROJECT/AUTH_TOKEN thì bỏ qua upload source map
 * (chỉ cảnh báo, không fail build). Runtime vẫn bắt lỗi nếu có DSN.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});

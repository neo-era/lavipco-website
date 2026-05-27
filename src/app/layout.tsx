import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/common/JsonLd";
import { GoogleAnalytics } from "@/components/common/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "đèn tín hiệu giao thông",
    "chiếu sáng đô thị thông minh",
    "smart city",
    "đèn LED đường phố",
    "hạ tầng điện",
    "LAVIPCO",
    "Lâm Việt Phát",
  ],
  authors: [{ name: SITE_CONFIG.fullName }],
  creator: SITE_CONFIG.fullName,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
        {/* Schema.org Organization + WebSite — áp dụng cho mọi trang */}
        <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
        {/* GA4/GTM defensive load (chỉ khi env có) */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}

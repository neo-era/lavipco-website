import type { Metadata } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { AboutHero } from "@/components/about/AboutHero";
import { CompanyStory } from "@/components/about/CompanyStory";
import { VisionMissionValues } from "@/components/about/VisionMissionValues";
import { CompanyTimeline } from "@/components/about/CompanyTimeline";
import { Leadership } from "@/components/about/Leadership";
import { CertificationsGrid } from "@/components/about/CertificationsGrid";
import { PartnersGrid } from "@/components/about/PartnersGrid";
import { AboutCTA } from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `Giới thiệu ${SITE_CONFIG.fullName} - đơn vị chuyên cung cấp giải pháp đèn tín hiệu giao thông, chiếu sáng đô thị thông minh và hạ tầng điện. Năng lực kỹ thuật, đội ngũ, chứng nhận và đối tác.`,
  keywords: [
    "giới thiệu LAVIPCO",
    "Lâm Việt Phát",
    "công ty chiếu sáng đô thị",
    "đối tác Smart City",
    "đội ngũ kỹ sư",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: `Giới thiệu | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: "/about",
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "vi_VN",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
};

/**
 * Trang Giới thiệu LAVIPCO - 8 sections (Server Component).
 * Nội dung text/leader/cert/partner còn placeholder - có TODO trong mỗi component.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <CompanyStory />
      <VisionMissionValues />
      <CompanyTimeline />
      <Leadership />
      <CertificationsGrid />
      <PartnersGrid />
      <AboutCTA />
    </>
  );
}

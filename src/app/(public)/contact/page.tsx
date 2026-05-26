import type { Metadata } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ với ${SITE_CONFIG.fullName} để được tư vấn về đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City. Hotline, email, địa chỉ trụ sở và bản đồ.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Liên hệ | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: "/contact",
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "vi_VN",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <ContactInfo />
            <ContactForm />
          </div>
        </Container>
      </section>
      <ContactMap />
    </>
  );
}

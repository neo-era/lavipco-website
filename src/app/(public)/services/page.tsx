import type { Metadata } from "next";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceCard } from "@/components/services/ServiceCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "Đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, chiếu sáng cảnh quan và hạ tầng điện - giải pháp kỹ thuật trọn gói từ LAVIPCO.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: `Dịch vụ | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: "/services",
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "vi_VN",
  },
};

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <ServicesHero />
      <section className="py-16 md:py-24">
        <Container>
          {services.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              Đang cập nhật danh sách dịch vụ.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  slug={service.slug}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

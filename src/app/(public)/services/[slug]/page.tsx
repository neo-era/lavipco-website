import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { getServiceExtras } from "@/lib/services-data";
import { Container } from "@/components/layout/Container";
import { ServiceDetailHero } from "@/components/services/ServiceDetailHero";
import { ServiceProcess } from "@/components/services/ServiceProcess";
import { ServiceBenefits } from "@/components/services/ServiceBenefits";
import { ServiceGallery } from "@/components/services/ServiceGallery";
import { RelatedProjects } from "@/components/services/RelatedProjects";
import { QuoteRequestForm } from "@/components/services/QuoteRequestForm";

export const revalidate = 60;
// Cho phép slug mới được prerender on-demand (ngoài danh sách generateStaticParams)
export const dynamicParams = true;

type RouteParams = { slug: string };

/** Sinh trước HTML cho tất cả service đang active. */
export async function generateStaticParams(): Promise<RouteParams[]> {
  const services = await db.service.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await db.service.findUnique({
    where: { slug },
    select: { title: true, description: true, coverImage: true },
  });

  if (!service) {
    return { title: "Không tìm thấy dịch vụ", robots: { index: false } };
  }

  return {
    title: service.title,
    description: service.description.slice(0, 160),
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: `${service.title} | ${SITE_CONFIG.name}`,
      description: service.description,
      url: `/services/${slug}`,
      type: "article",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      images: service.coverImage
        ? [{ url: service.coverImage, width: 1200, height: 630, alt: service.title }]
        : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const service = await db.service.findUnique({
    where: { slug },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  const extras = getServiceExtras(slug);

  return (
    <>
      <ServiceDetailHero
        title={service.title}
        description={service.description}
        icon={service.icon}
        coverImage={service.coverImage}
      />

      {/* Mô tả chi tiết - rich content. Hiện render plain text, hỗ trợ paragraph qua \n\n */}
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="prose prose-slate max-w-none">
            {service.description.split(/\n\s*\n/).map((para, idx) => (
              <p key={idx} className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {para.trim()}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <ServiceProcess steps={extras.processSteps} />
      <ServiceBenefits benefits={extras.benefits} />
      <ServiceGallery images={service.coverImage ? [service.coverImage] : []} />
      <RelatedProjects category={extras.relatedCategory} serviceTitle={service.title} />
      <QuoteRequestForm serviceSlug={service.slug} serviceTitle={service.title} />
    </>
  );
}

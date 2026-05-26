import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { PROJECT_CATEGORY_META } from "@/lib/projects-data";
import { Container } from "@/components/layout/Container";
import { ProjectDetailHero } from "@/components/projects/ProjectDetailHero";
import { ProjectInfoCard } from "@/components/projects/ProjectInfoCard";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectVideo } from "@/components/projects/ProjectVideo";
import { RelatedProducts } from "@/components/projects/RelatedProducts";
import { RelatedService } from "@/components/projects/RelatedService";
import { MoreProjects } from "@/components/projects/MoreProjects";

export const revalidate = 60;
export const dynamicParams = true;

type RouteParams = { slug: string };

/** Prerender SSG cho tất cả project hiện có. */
export async function generateStaticParams(): Promise<RouteParams[]> {
  const projects = await db.project.findMany({ select: { slug: true } });
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug },
    select: { title: true, summary: true, description: true, images: true, category: true },
  });

  if (!project) {
    return { title: "Không tìm thấy dự án", robots: { index: false } };
  }

  const description = (
    project.summary ||
    project.description ||
    `Dự án ${project.title} - ${PROJECT_CATEGORY_META[project.category].label}`
  ).slice(0, 160);

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: `${project.title} | ${SITE_CONFIG.name}`,
      description,
      url: `/projects/${slug}`,
      type: "article",
      siteName: SITE_CONFIG.name,
      locale: "vi_VN",
      images: project.images[0]
        ? [{ url: project.images[0], width: 1200, height: 630, alt: project.title }]
        : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  const project = await db.project.findUnique({ where: { slug } });
  if (!project) notFound();

  const meta = PROJECT_CATEGORY_META[project.category];

  return (
    <>
      <ProjectDetailHero
        title={project.title}
        summary={project.summary}
        category={project.category}
        coverImage={project.images[0]}
      />

      {/* Description + Info card layout 2 cột */}
      <section className="py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
          <article className="space-y-4">
            <h2 className="text-2xl font-bold md:text-3xl">Mô tả dự án</h2>
            {project.description ? (
              project.description.split(/\n\s*\n/).map((para, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed text-muted-foreground md:text-lg"
                >
                  {para.trim()}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground italic">
                Đang cập nhật mô tả chi tiết. Liên hệ LAVIPCO để xem hồ sơ năng lực
                đầy đủ.
              </p>
            )}
          </article>

          <ProjectInfoCard
            client={project.client}
            location={project.location}
            year={project.year}
            scale={project.scale}
            category={project.category}
          />
        </Container>
      </section>

      <ProjectGallery images={project.images} title={project.title} />

      <ProjectVideo videoUrl={project.videoUrl} title={project.title} />

      <RelatedProducts productCategorySlug={meta.productCategorySlug} />

      <RelatedService serviceSlug={meta.serviceSlug} />

      <MoreProjects category={project.category} excludeId={project.id} />
    </>
  );
}

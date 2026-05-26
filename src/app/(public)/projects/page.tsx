import type { Metadata } from "next";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";
import { parseProjectCategory, PROJECTS_PAGE_SIZE } from "@/lib/projects-data";
import { Container } from "@/components/layout/Container";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsFilter } from "@/components/projects/ProjectsFilter";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsPagination } from "@/components/projects/ProjectsPagination";

export const revalidate = 60;
// Trang list có URL searchParams động (category, page) - không thể prerender hoàn toàn
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dự án",
  description:
    "Portfolio các dự án LAVIPCO đã triển khai: đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, chiếu sáng cảnh quan và hạ tầng điện.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: `Dự án | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    url: "/projects",
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "vi_VN",
  },
};

type SearchParams = { category?: string; page?: string };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category: rawCategory, page: rawPage } = await searchParams;

  const category = parseProjectCategory(rawCategory);
  const page = Math.max(1, Number(rawPage) || 1);
  const skip = (page - 1) * PROJECTS_PAGE_SIZE;

  const where = category ? { category } : {};

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { year: "desc" }],
      skip,
      take: PROJECTS_PAGE_SIZE,
    }),
    db.project.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE));

  return (
    <>
      <ProjectsHero />
      <section className="py-12 md:py-16">
        <Container className="space-y-8">
          <ProjectsFilter currentCategory={category} />

          {projects.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                Không có dự án nào trong nhóm này. Quay lại sau hoặc xem tất cả dự án.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    slug={p.slug}
                    title={p.title}
                    summary={p.summary}
                    location={p.location}
                    year={p.year}
                    category={p.category}
                    images={p.images}
                  />
                ))}
              </div>

              <ProjectsPagination
                currentPage={page}
                totalPages={totalPages}
                category={category}
              />

              <p className="text-center text-xs text-muted-foreground">
                Hiển thị {skip + 1}–{skip + projects.length} trong tổng {total} dự án
              </p>
            </>
          )}
        </Container>
      </section>
    </>
  );
}

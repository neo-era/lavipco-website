import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Calendar, Lightbulb } from "lucide-react";

import { db } from "@/lib/db";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PROJECT_CATEGORY_LABEL: Record<string, string> = {
  TRAFFIC_LIGHT: "Đèn tín hiệu giao thông",
  URBAN_LIGHTING: "Chiếu sáng đô thị",
  LANDSCAPE_LIGHTING: "Chiếu sáng cảnh quan",
  POWER_INFRASTRUCTURE: "Hạ tầng điện",
  SMART_CITY: "Smart City",
  OTHER: "Khác",
};

/**
 * Section "Dự án tiêu biểu" — Server Component.
 * Featured trước; nếu chưa đủ 6 thì fill thêm dự án mới nhất.
 */
export async function FeaturedProjects() {
  const featured = await db.project.findMany({
    where: { isFeatured: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  let projects = featured;
  if (projects.length < 6) {
    const fill = await db.project.findMany({
      where: { id: { notIn: featured.map((p) => p.id) } },
      orderBy: { year: "desc" },
      take: 6 - featured.length,
    });
    projects = [...featured, ...fill];
  }

  if (projects.length === 0) return null;

  return (
    <section id="featured-projects" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Portfolio
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Dự án tiêu biểu
          </h2>
          <p className="mt-3 text-muted-foreground">
            Những công trình LAVIPCO đã triển khai trên cả nước.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const cover = p.images[0];
            return (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-accent/15"
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiMxZTNhOGEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/30">
                    <Lightbulb className="h-20 w-20" />
                  </div>
                )}

                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
                  <Badge
                    variant="accent"
                    className="rounded-full text-[10px] uppercase tracking-wider"
                  >
                    {PROJECT_CATEGORY_LABEL[p.category] ?? p.category}
                  </Badge>
                  <h3 className="text-balance text-lg font-semibold leading-tight">
                    {p.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.location}
                      </span>
                    )}
                    {p.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {p.year}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="brand">
            <Link href="/projects">
              Xem tất cả dự án <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

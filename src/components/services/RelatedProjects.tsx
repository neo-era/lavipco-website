import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Calendar, Lightbulb } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

import { db } from "@/lib/db";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Section "Dự án liên quan" — fetch theo ProjectCategory map từ service.
 * Ẩn nếu không có project nào.
 */
export async function RelatedProjects({
  category,
  serviceTitle,
}: {
  category: ProjectCategory | null;
  serviceTitle: string;
}) {
  if (!category) return null;

  const projects = await db.project.findMany({
    where: { category },
    orderBy: [{ isFeatured: "desc" }, { year: "desc" }],
    take: 3,
  });

  if (projects.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="brand" className="mb-3 rounded-full">
              Portfolio
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Dự án liên quan
            </h2>
            <p className="mt-2 text-muted-foreground">
              Một số công trình LAVIPCO đã thực hiện trong lĩnh vực {serviceTitle.toLowerCase()}.
            </p>
          </div>
          <Button asChild variant="link" className="text-brand-primary">
            <Link href="/projects">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiMxZTNhOGEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/30">
                    <Lightbulb className="h-20 w-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 text-white">
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
      </Container>
    </section>
  );
}

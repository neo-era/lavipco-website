import Image from "next/image";
import { Lightbulb } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { PROJECT_CATEGORY_META } from "@/lib/projects-data";

export function ProjectDetailHero({
  title,
  summary,
  category,
  coverImage,
}: {
  title: string;
  summary?: string | null;
  category: ProjectCategory;
  coverImage?: string | null;
}) {
  const categoryLabel = PROJECT_CATEGORY_META[category].label;

  return (
    <section className="relative overflow-hidden border-b bg-brand-dark text-white">
      {/* Full-width banner image với fade overlay */}
      <div className="absolute inset-0">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiMxZTNhOGEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark">
            <Lightbulb className="h-40 w-40 text-brand-accent/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/40" />
      </div>

      <Container className="relative py-20 md:py-28">
        <Breadcrumb
          items={[
            { title: "Dự án", href: "/projects" },
            { title },
          ]}
          className="mb-6 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-4xl space-y-4">
          <Badge variant="accent" className="rounded-full px-3 py-1">
            {categoryLabel}
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {summary && <p className="text-lg text-white/85 md:text-xl">{summary}</p>}
        </div>
      </Container>
    </section>
  );
}

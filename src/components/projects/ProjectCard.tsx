import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Lightbulb } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

import { PROJECT_CATEGORY_META } from "@/lib/projects-data";
import { Badge } from "@/components/ui/badge";

type Props = {
  slug: string;
  title: string;
  summary?: string | null;
  location?: string | null;
  year?: number | null;
  category: ProjectCategory;
  images: string[];
};

export function ProjectCard({ slug, title, summary, location, year, category, images }: Props) {
  const cover = images[0];
  const categoryLabel = PROJECT_CATEGORY_META[category].label;

  return (
    <Link
      href={`/projects/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-primary/20 to-brand-accent/15">
        {cover ? (
          <Image
            src={cover}
            alt={title}
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
        <Badge variant="accent" className="absolute left-3 top-3 rounded-full text-[10px] uppercase tracking-wider">
          {categoryLabel}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-brand-primary">
          {title}
        </h3>
        {summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
          {year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { ProjectCategory } from "@prisma/client";

import { cn } from "@/lib/utils";
import { PROJECT_CATEGORY_META, PROJECT_CATEGORY_ORDER } from "@/lib/projects-data";

type Props = {
  currentCategory: ProjectCategory | null;
};

/**
 * Filter tabs theo loại dự án - link với URL searchParam ?category=...
 * Khi click "Tất cả" → URL không có category (clean).
 */
export function ProjectsFilter({ currentCategory }: Props) {
  return (
    <nav aria-label="Lọc theo loại dự án" className="overflow-x-auto">
      <ul className="flex min-w-max gap-2">
        <li>
          <FilterTab href="/projects" active={currentCategory === null}>
            Tất cả
          </FilterTab>
        </li>
        {PROJECT_CATEGORY_ORDER.map((cat) => (
          <li key={cat}>
            <FilterTab
              href={`/projects?category=${cat}`}
              active={currentCategory === cat}
            >
              {PROJECT_CATEGORY_META[cat].label}
            </FilterTab>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-block whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-primary bg-brand-primary text-white"
          : "border-border bg-background text-foreground/70 hover:border-brand-primary/30 hover:text-brand-primary",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

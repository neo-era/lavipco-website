import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  category: ProjectCategory | null;
};

/**
 * Pagination cho /projects.
 * Tạo URL `/projects?category=...&page=N`. Bỏ qua page=1 cho URL gọn.
 */
export function ProjectsPagination({ currentPage, totalPages, category }: Props) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  };

  // Sinh dãy số trang gọn: 1 ... currentPage-1, current, currentPage+1 ... last
  const pages: (number | "ellipsis")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav aria-label="Phân trang dự án" className="flex items-center justify-center gap-1">
      <PaginationLink
        href={buildUrl(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>

      {pages.map((p, idx) =>
        p === "ellipsis" ? (
          <span key={`e-${idx}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <PaginationLink
            key={p}
            href={buildUrl(p)}
            active={p === currentPage}
            aria-label={`Trang ${p}`}
          >
            {p}
          </PaginationLink>
        ),
      )}

      <PaginationLink
        href={buildUrl(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const baseClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors";
  if (disabled) {
    return (
      <span
        className={cn(baseClass, "cursor-not-allowed border-border text-muted-foreground/50")}
        aria-disabled
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      {...rest}
      aria-current={active ? "page" : undefined}
      className={cn(
        baseClass,
        active
          ? "border-brand-primary bg-brand-primary text-white"
          : "border-border bg-background text-foreground/70 hover:border-brand-primary/30 hover:text-brand-primary",
      )}
    >
      {children}
    </Link>
  );
}

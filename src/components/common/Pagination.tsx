import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  /** Hàm sinh URL cho 1 trang cụ thể. Caller tự ghép searchParams khác. */
  buildPageUrl: (page: number) => string;
  className?: string;
};

/**
 * Pagination chung tái sử dụng cho /projects, /products, /blog...
 *
 * Hiển thị: trang 1, current±1, trang cuối, "..." giữa các khoảng.
 * Caller chỉ cần truyền hàm `buildPageUrl(page)` để giữ nguyên các
 * searchParams khác (category, brand, sort...).
 */
export function Pagination({ currentPage, totalPages, buildPageUrl, className }: Props) {
  if (totalPages <= 1) return null;

  // Dãy số trang compact
  const pages: (number | "ellipsis")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav
      aria-label="Phân trang"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <PaginationLink
        href={buildPageUrl(currentPage - 1)}
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
            href={buildPageUrl(p)}
            active={p === currentPage}
            aria-label={`Trang ${p}`}
          >
            {p}
          </PaginationLink>
        ),
      )}

      <PaginationLink
        href={buildPageUrl(currentPage + 1)}
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

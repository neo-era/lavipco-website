import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  /** Tiêu đề hiển thị. */
  title: string;
  /** href: undefined = item cuối (trang hiện tại). */
  href?: string;
};

/**
 * Breadcrumb điều hướng - dùng cho các trang con (about, projects, services...).
 * Item đầu tiên luôn là "Trang chủ" (icon Home), tự thêm.
 *
 * @example
 *   <Breadcrumb items={[{ title: "Dịch vụ", href: "/services" }, { title: "Đèn LED" }]} />
 *   // → Trang chủ > Dịch vụ > Đèn LED
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-foreground"
            aria-label="Trang chủ"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.title}-${idx}`} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
              {isLast || !item.href ? (
                <span
                  className="font-medium text-foreground"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.title}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-foreground">
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

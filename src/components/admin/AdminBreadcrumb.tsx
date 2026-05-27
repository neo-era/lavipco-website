"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ADMIN_NAV } from "./AdminSidebar";

/**
 * Breadcrumb tự sinh từ pathname.
 * /admin/orders/abc123 → "Quản trị > Đơn hàng > abc123"
 *
 * Cấp 1 (admin): label = "Quản trị" (không link)
 * Cấp 2: match với ADMIN_NAV để lấy label tiếng Việt
 * Cấp 3+: hiển thị raw slug (lowercase đầu)
 */
export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["admin", "orders", ...]

  if (segments.length === 0 || segments[0] !== "admin") return null;

  const crumbs: Array<{ label: string; href?: string }> = [];

  // Cấp 1: Quản trị
  crumbs.push({ label: "Quản trị", href: "/admin/dashboard" });

  if (segments.length >= 2) {
    const sectionHref = `/admin/${segments[1]}`;
    const navItem = ADMIN_NAV.find((n) => n.href === sectionHref);
    crumbs.push({
      label: navItem?.label ?? segments[1],
      href: segments.length > 2 ? sectionHref : undefined,
    });
  }

  // Cấp 3+: raw segment (id/slug/code)
  for (let i = 2; i < segments.length; i++) {
    const isLast = i === segments.length - 1;
    crumbs.push({
      label: segments[i],
      href: isLast ? undefined : `/${segments.slice(0, i + 1).join("/")}`,
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {crumbs.map((c, idx) => (
          <li key={`${c.label}-${idx}`} className="flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
            {c.href ? (
              <Link href={c.href} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

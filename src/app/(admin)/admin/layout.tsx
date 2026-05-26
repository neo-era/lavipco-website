import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Briefcase,
  Wrench,
  Newspaper,
  Settings,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";
import { BrandLogo } from "@/components/common/BrandLogo";

export const metadata: Metadata = {
  title: {
    default: "Quản trị",
    template: "%s · Quản trị · " + SITE_CONFIG.name,
  },
  robots: { index: false, follow: false },
};

const adminNav = [
  { title: "Tổng quan", href: "/admin/dashboard", Icon: LayoutDashboard },
  { title: "Sản phẩm", href: "/admin/products", Icon: Package },
  { title: "Đơn hàng", href: "/admin/orders", Icon: ShoppingBag },
  { title: "Khách hàng", href: "/admin/customers", Icon: Users },
  { title: "Dự án", href: "/admin/projects", Icon: Briefcase },
  { title: "Dịch vụ", href: "/admin/services", Icon: Wrench },
  { title: "Tin tức", href: "/admin/blog", Icon: Newspaper },
  { title: "Cài đặt", href: "/admin/settings", Icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // TODO (Phase 5 - Auth): chặn nếu session.user.role !== 'ADMIN' và redirect /login
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="border-b px-6 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2"
            aria-label={`${SITE_CONFIG.name} - Quản trị`}
          >
            <BrandLogo size="sm" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Quản trị
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNav.map(({ title, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-brand-primary/10 hover:text-brand-primary"
            >
              <Icon className="h-4 w-4" />
              {title}
            </Link>
          ))}
        </nav>
        <div className="border-t px-3 py-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
          >
            ← Quay lại website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <header className="border-b bg-background px-6 py-3 text-sm text-muted-foreground md:hidden">
          {/* Mobile: TODO menu burger; hiện skeleton sidebar */}
          Quản trị · {SITE_CONFIG.name}
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

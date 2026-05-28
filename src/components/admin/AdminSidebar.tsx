"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  Briefcase,
  Wrench,
  Newspaper,
  Ticket,
  MessageSquare,
  Settings,
  UserCog,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/common/BrandLogo";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn hàng", Icon: ShoppingBag },
  { href: "/admin/products", label: "Sản phẩm", Icon: Package },
  { href: "/admin/categories", label: "Danh mục", Icon: Tag },
  { href: "/admin/customers", label: "Khách hàng", Icon: Users },
  { href: "/admin/projects", label: "Dự án", Icon: Briefcase },
  { href: "/admin/services", label: "Dịch vụ", Icon: Wrench },
  { href: "/admin/blog", label: "Tin tức", Icon: Newspaper },
  { href: "/admin/coupons", label: "Khuyến mãi", Icon: Ticket },
  { href: "/admin/messages", label: "Tin nhắn liên hệ", Icon: MessageSquare },
  { href: "/admin/content", label: "Nội dung trang", Icon: LayoutTemplate },
  { href: "/admin/settings", label: "Cấu hình", Icon: Settings },
  { href: "/admin/users", label: "Người dùng", Icon: UserCog },
];

export { NAV as ADMIN_NAV };

/**
 * Admin sidebar - desktop fixed left. Mobile dùng SidebarContent trong
 * Sheet ở Topbar.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <SidebarContent pathname={pathname} />
    </aside>
  );
}

/**
 * Reusable content cho cả desktop sidebar và mobile drawer.
 */
export function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <div className="border-b px-6 py-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2"
          aria-label="LAVIPCO Admin"
        >
          <BrandLogo size="sm" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Quản trị
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/"
          className="block rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
        >
          ← Quay lại website
        </Link>
      </div>
    </>
  );
}

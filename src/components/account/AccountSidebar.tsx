"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Heart,
  KeyRound,
  LogOut,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Item = {
  href?: string;
  label: string;
  Icon: LucideIcon;
  /** Khi true → action thay vì link (Đăng xuất). */
  action?: "signOut";
};

const ITEMS: Item[] = [
  { href: "/account", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/account/orders", label: "Đơn hàng", Icon: ShoppingBag },
  { href: "/account/addresses", label: "Sổ địa chỉ", Icon: MapPin },
  { href: "/account/wishlist", label: "Yêu thích", Icon: Heart },
  { href: "/account/security", label: "Đổi mật khẩu", Icon: KeyRound },
  { label: "Đăng xuất", Icon: LogOut, action: "signOut" },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Bạn";

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/account") return pathname === "/account";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="space-y-4">
      {/* User header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <UserCircle className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            {session?.user?.email && (
              <p className="truncate text-xs text-muted-foreground">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="rounded-xl border bg-card p-2">
        <ul className="space-y-0.5">
          {ITEMS.map((item) => {
            const active = isActive(item.href);
            if (item.action === "signOut") {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <item.Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-foreground/80 hover:bg-muted",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { AdminUserMenu } from "./AdminUserMenu";
import { SidebarContent } from "./AdminSidebar";

/**
 * Topbar admin (64px height).
 * Mobile: gồm cả Sheet trigger sidebar bên trái.
 * Desktop: chỉ breadcrumb (sidebar hiển thị riêng cố định).
 */
export function AdminTopbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4 lg:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <AdminBreadcrumb />
      </div>

      {/* Search nhanh - TODO Phase 5.x admin search */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex"
        aria-label="Tìm kiếm nhanh"
        disabled
        title="Sắp ra mắt"
      >
        <Search className="h-4 w-4" />
        <span className="text-muted-foreground">Tìm nhanh…</span>
      </Button>

      {/* Notification bell - placeholder count=0 */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Thông báo"
        disabled
        title="Sắp ra mắt"
      >
        <Bell className="h-5 w-5" />
      </Button>

      <AdminUserMenu />
    </header>
  );
}

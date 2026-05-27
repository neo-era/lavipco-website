import type { Metadata } from "next";

import { SITE_CONFIG } from "@/lib/constants";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata: Metadata = {
  title: {
    default: "Quản trị",
    template: "%s · Quản trị · " + SITE_CONFIG.name,
  },
  robots: { index: false, follow: false },
};

/**
 * Admin layout — sidebar trái + topbar + content.
 * Middleware (src/middleware.ts) đã chặn user role !== ADMIN.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

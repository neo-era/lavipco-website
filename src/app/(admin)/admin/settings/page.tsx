import type { Metadata } from "next";

import { loadSettings } from "@/lib/actions/admin-settings";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const metadata: Metadata = { title: "Cài đặt" };

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await loadSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Cài đặt website</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cấu hình toàn site lưu trong bảng Setting key-value. Một số setting cần
          khởi động lại app hoặc clear cache để có hiệu lực.
        </p>
      </div>

      <AdminSettingsForm defaultValues={settings} />
    </div>
  );
}

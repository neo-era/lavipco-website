import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminCreateUserForm } from "@/components/admin/AdminCreateUserForm";

export const metadata: Metadata = { title: "Thêm tài khoản nội bộ" };

export default function NewInternalUserPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm tài khoản nội bộ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo tài khoản STAFF hoặc ADMIN. Tài khoản được xác minh email sẵn.
        </p>
      </div>
      <AdminCreateUserForm />
    </div>
  );
}

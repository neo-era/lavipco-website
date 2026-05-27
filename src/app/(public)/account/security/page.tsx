import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/security");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Bảo mật</h1>
        <p className="mt-1 text-muted-foreground">
          Đổi mật khẩu định kỳ để giữ tài khoản an toàn.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center gap-3 border-b pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Đổi mật khẩu</h2>
            <p className="text-sm text-muted-foreground">
              Nhập mật khẩu hiện tại và mật khẩu mới.
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}

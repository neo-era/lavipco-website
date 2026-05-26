import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/constants";
import { BrandLogo } from "@/components/common/BrandLogo";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block" aria-label={SITE_CONFIG.name}>
            <BrandLogo size="lg" />
          </Link>
        </div>

        <div className="rounded-lg border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
            <p className="text-sm text-muted-foreground">
              Đăng ký để theo dõi đơn hàng và lưu yêu cầu báo giá.
            </p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
              className="font-medium text-brand-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Quay lại {SITE_CONFIG.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

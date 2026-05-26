import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { GOOGLE_OAUTH_ENABLED } from "@/lib/auth.config";
import { SITE_CONFIG } from "@/lib/constants";
import { BrandLogo } from "@/components/common/BrandLogo";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  // Đã đăng nhập → quay về callbackUrl hoặc /
  if (session?.user) {
    redirect(callbackUrl || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block" aria-label={SITE_CONFIG.name}>
            <BrandLogo size="lg" />
          </Link>
        </div>

        <div className="rounded-lg border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để quản lý đơn hàng và yêu cầu báo giá của bạn.
            </p>
          </div>

          <SignInForm
            callbackUrl={callbackUrl}
            initialError={error ? "Đăng nhập thất bại, thử lại." : undefined}
            googleEnabled={GOOGLE_OAUTH_ENABLED}
          />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"}
              className="font-medium text-brand-primary hover:underline"
            >
              Đăng ký ngay
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

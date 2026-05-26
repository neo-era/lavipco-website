/**
 * Middleware bảo vệ route. Chạy ở Edge runtime — chỉ import auth.config
 * (KHÔNG import @prisma/client, bcryptjs).
 *
 * Quy tắc:
 *  - /admin/*    : chỉ user có role === "ADMIN"
 *  - /account/*  : bất kỳ user đã login
 *  - Chưa login → redirect /sign-in?callbackUrl=<đường-dẫn-cũ>
 *  - Login nhưng không đủ quyền → redirect /
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { auth: session, nextUrl } = req;
  const { pathname } = nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  // Chưa login mà vào route bảo vệ → đẩy về /sign-in
  if (!session) {
    if (isAdminRoute || isAccountRoute) {
      const url = nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Đã login nhưng vào /admin mà không phải ADMIN → đẩy về trang chủ
  if (isAdminRoute && session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

/**
 * Matcher giới hạn middleware chỉ chạy ở các route cần kiểm tra.
 * Tránh chi phí auth check ở mọi request (đặc biệt static assets).
 */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};

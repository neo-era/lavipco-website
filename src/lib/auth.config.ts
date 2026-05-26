/**
 * Auth.js v5 config - phần edge-safe (không có Prisma, không có bcrypt).
 *
 * File này được middleware import (chạy ở Edge Runtime). Vì vậy KHÔNG được:
 *  - Import @prisma/client (native binary)
 *  - Import bcryptjs (sync crypto)
 *  - Import bất cứ Server Action nào touching DB
 *
 * Provider Credentials và adapter sẽ được nối vào trong src/lib/auth.ts
 * (chạy ở Node runtime cho Server Actions / API routes).
 */
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import Google from "next-auth/providers/google";

const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

/** Có thể export sang client để conditional render nút "Đăng nhập Google". */
export const GOOGLE_OAUTH_ENABLED = isGoogleConfigured;

export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: { strategy: "jwt" },
  providers: isGoogleConfigured
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    /**
     * Encode role vào JWT khi user vừa login.
     * `token.sub` (subject) được Auth.js tự set bằng user.id — không cần
     * encode thêm trường id. Lần gọi sau token đã có sẵn nên giữ nguyên.
     *
     * Lúc Credentials.authorize trả về object có .role thì user.role có sẵn.
     * Lúc Google OAuth lần đầu user.role chưa có (default USER ở DB) — lookup
     * được làm ở src/lib/auth.ts callback (extends config này).
     */
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    /** Gắn id + role từ token sang session để client dùng. */
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole | undefined) ?? "USER";
      }
      return session;
    },
  },
  // Tắt log "trust host" cảnh báo khi deploy
  trustHost: true,
} satisfies NextAuthConfig;

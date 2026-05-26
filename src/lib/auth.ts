/**
 * Auth.js v5 - config chính (Node runtime).
 *
 * Export `auth`, `signIn`, `signOut`, `handlers` cho:
 *  - Server Components / Server Actions / Route Handlers (qua auth())
 *  - API route /api/auth/[...nextauth] (qua handlers.GET / handlers.POST)
 *
 * KHÔNG dùng file này trong middleware (xem src/lib/auth.config.ts).
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { authConfig } from "./auth.config";
import { db } from "./db";
import { signInSchema } from "./validations/auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        // Validate sơ bộ — chi tiết đã validate ở Server Action trước khi gọi signIn
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            hashedPassword: true,
          },
        });
        if (!user || !user.hashedPassword) return null;

        const match = await bcrypt.compare(password, user.hashedPassword);
        if (!match) return null;

        // Trả về object sẽ được encode vào JWT qua callback authConfig.callbacks.jwt
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Override jwt callback để lookup role từ DB khi user login bằng Google
     * (lần đầu user.role chưa có).
     */
    async jwt(args) {
      const token = await authConfig.callbacks!.jwt!(args);
      // Nếu role chưa có trong token và đã có sub (= user.id) → lookup từ DB
      if (token && !token.role && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  events: {
    /**
     * Khi user đăng ký qua Google OAuth lần đầu, PrismaAdapter sẽ tạo User mới
     * với role mặc định USER (giá trị default ở schema). Không cần làm gì thêm.
     */
  },
});

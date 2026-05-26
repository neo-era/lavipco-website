/**
 * Module augmentation cho Auth.js v5.
 * Thêm `id` và `role` vào Session.user và JWT để TypeScript hiểu đúng.
 *
 * File này được TypeScript tự pick lên qua `include` trong tsconfig.json.
 */
import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

export {};

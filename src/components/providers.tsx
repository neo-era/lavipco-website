"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Wrapper client component để gắn SessionProvider vào root layout.
 *
 * Vì root layout là server component, không thể trực tiếp tạo client context
 * mà không có boundary. Provider này là boundary đó — child vẫn có thể là RSC.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

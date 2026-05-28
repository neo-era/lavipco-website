/**
 * Sentry init phía server (Node.js runtime).
 * Defensive: chỉ init khi có DSN → không có env thì Sentry tắt hoàn toàn.
 * DSN đọc từ SENTRY_DSN (server-only) hoặc fallback NEXT_PUBLIC_SENTRY_DSN.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    debug: false,
  });
}

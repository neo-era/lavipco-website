/**
 * Sentry init phía client (browser).
 * Defensive: chỉ init khi có NEXT_PUBLIC_SENTRY_DSN (biến này expose ra browser).
 * Không bật Session Replay để tránh phải nới CSP (worker-src/blob) và giữ bundle nhẹ.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    debug: false,
  });
}

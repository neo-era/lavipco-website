/**
 * Next.js instrumentation hook — nạp Sentry config theo runtime.
 * Cần `experimental.instrumentationHook: true` trong next.config (Next 14).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Rate limit defensive: Upstash Redis nếu env có, fallback in-memory single-instance.
 *
 * Env:
 *  - UPSTASH_REDIS_REST_URL
 *  - UPSTASH_REDIS_REST_TOKEN
 *
 * Đăng ký Upstash free tier (10k command/day) tại https://upstash.com.
 *
 * Limiters:
 *  - authLimiter:    5 lần / 15 phút / IP (login, register, reset password)
 *  - contactLimiter: 3 lần / 1 giờ / IP (form liên hệ, yêu cầu báo giá)
 *  - searchLimiter:  30 lần / 1 phút / IP (search autocomplete)
 *  - apiLimiter:     60 lần / 1 phút / IP (API route khác, fallback chung)
 *
 * Lưu ý in-memory:
 *  - Single-instance OK (VPS PM2 1 process).
 *  - Multi-instance / serverless (Vercel) → bắt buộc Upstash.
 *  - Restart server reset memory → attacker spam khi server vừa khởi động.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const RATE_LIMIT_ENABLED_REDIS = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// ====================================================================
// In-memory fallback
// ====================================================================

type InMemoryEntry = { count: number; resetAt: number };

class InMemoryLimiter {
  private store = new Map<string, InMemoryEntry>();
  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  async limit(key: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      const resetAt = now + this.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - 1, reset: resetAt };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, limit: this.maxRequests, remaining: 0, reset: entry.resetAt };
    }

    entry.count++;
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      reset: entry.resetAt,
    };
  }
}

// ====================================================================
// Build limiters - chọn Redis vs in-memory dựa trên env
// ====================================================================

let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

function buildLimiter(args: {
  prefix: string;
  maxRequests: number;
  windowSec: number;
}): { limit: (key: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }> } {
  if (RATE_LIMIT_ENABLED_REDIS) {
    const rl = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(args.maxRequests, `${args.windowSec} s`),
      prefix: `lavipco:${args.prefix}`,
      analytics: false,
    });
    return {
      limit: async (key: string) => {
        const res = await rl.limit(key);
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
        };
      },
    };
  }

  // Fallback in-memory
  const memory = new InMemoryLimiter(args.maxRequests, args.windowSec * 1000);
  return {
    limit: (key: string) => memory.limit(`${args.prefix}:${key}`),
  };
}

export const authLimiter = buildLimiter({
  prefix: "auth",
  maxRequests: 5,
  windowSec: 15 * 60, // 15 phút
});

export const contactLimiter = buildLimiter({
  prefix: "contact",
  maxRequests: 3,
  windowSec: 60 * 60, // 1 giờ
});

export const searchLimiter = buildLimiter({
  prefix: "search",
  maxRequests: 30,
  windowSec: 60, // 1 phút
});

export const apiLimiter = buildLimiter({
  prefix: "api",
  maxRequests: 60,
  windowSec: 60, // 1 phút
});

// ====================================================================
// Helper: get client IP từ headers
// ====================================================================

import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

/**
 * Sugar: check rate limit theo IP + return error message friendly.
 *
 * @example
 *   const rl = await checkRateLimit(authLimiter, "login");
 *   if (!rl.ok) return { ok: false, error: rl.message };
 */
export async function checkRateLimit(
  limiter: { limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> },
  scope: string,
  extraKey?: string,
): Promise<
  | { ok: true; remaining: number; reset: number }
  | { ok: false; message: string; reset: number }
> {
  const ip = await getClientIp();
  const key = extraKey ? `${ip}:${extraKey}` : ip;
  const result = await limiter.limit(`${scope}:${key}`);

  if (!result.success) {
    const secondsLeft = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    const minutes = Math.ceil(secondsLeft / 60);
    const friendlyTime =
      minutes > 1 ? `${minutes} phút` : `${secondsLeft} giây`;
    return {
      ok: false,
      message: `Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ${friendlyTime}.`,
      reset: result.reset,
    };
  }

  return { ok: true, remaining: result.remaining, reset: result.reset };
}

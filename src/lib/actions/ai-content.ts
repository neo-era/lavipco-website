"use server";

/**
 * Admin Copilot — server action sinh content bằng Claude.
 *
 * Require ADMIN role. Rate limit để tránh đốt API credit (dùng searchLimiter
 * 30/phút — đủ thoải mái cho admin, chặn loop vô hạn).
 *
 * Defensive: thiếu ANTHROPIC_API_KEY → trả lỗi friendly, UI tự ẩn nút.
 */
import { auth } from "@/lib/auth";
import { callClaude, AI_ENABLED } from "@/lib/ai";
import { buildPrompt, type AIGenerateContext } from "@/lib/ai/prompts";
import { searchLimiter, checkRateLimit } from "@/lib/rate-limit";

export type GenerateContentResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function generateContent(
  ctx: AIGenerateContext,
): Promise<GenerateContentResult> {
  // Auth: chỉ ADMIN
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, error: "Yêu cầu quyền quản trị" };
  }

  if (!AI_ENABLED) {
    return {
      ok: false,
      error: "Tính năng AI chưa bật. Thêm ANTHROPIC_API_KEY vào môi trường.",
    };
  }

  // Rate limit theo user.id - chống spam đốt credit
  const rl = await checkRateLimit(searchLimiter, "ai-generate", session.user.id);
  if (!rl.ok) {
    return { ok: false, error: rl.message };
  }

  const { system, prompt, maxTokens, temperature } = buildPrompt(ctx);

  const result = await callClaude({ system, prompt, maxTokens, temperature });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true, text: result.text };
}

/** Check AI có bật không - dùng để conditional render nút ở Server Component. */
export async function isAIEnabled(): Promise<boolean> {
  return AI_ENABLED;
}

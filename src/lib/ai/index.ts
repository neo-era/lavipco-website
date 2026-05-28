/**
 * Claude API client - defensive, gọi qua fetch REST (không cần SDK).
 *
 * Env:
 *  - ANTHROPIC_API_KEY: API key từ console.anthropic.com
 *  - ANTHROPIC_MODEL: model ID (optional, default Haiku 4.5 cho rẻ)
 *
 * Khi thiếu key → AI_ENABLED = false → server action trả lỗi friendly,
 * UI tự ẩn nút AI (không crash app).
 *
 * Tài liệu: https://docs.anthropic.com/en/api/messages
 */

export const AI_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY);

/** Default Haiku 4.5 - nhanh + rẻ (~$1/triệu input token). Override qua env. */
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export type CallClaudeOptions = {
  /** System prompt định hướng vai trò + format output. */
  system: string;
  /** Nội dung user message (context để sinh content). */
  prompt: string;
  /** Max tokens output. Default 1500 (đủ cho mô tả sản phẩm/blog). */
  maxTokens?: number;
  /** Temperature 0-1. Default 0.7 (sáng tạo vừa phải cho marketing copy). */
  temperature?: number;
  /** Override model. */
  model?: string;
};

export type CallClaudeResult =
  | { ok: true; text: string; usage: { inputTokens: number; outputTokens: number } }
  | { ok: false; error: string };

/**
 * Gọi Claude Messages API. Best-effort: trả error thay vì throw.
 */
export async function callClaude(opts: CallClaudeOptions): Promise<CallClaudeResult> {
  if (!AI_ENABLED) {
    return { ok: false, error: "Tính năng AI chưa được cấu hình (thiếu ANTHROPIC_API_KEY)" };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": API_VERSION,
      },
      body: JSON.stringify({
        model: opts.model || DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 1500,
        temperature: opts.temperature ?? 0.7,
        system: opts.system,
        messages: [{ role: "user", content: opts.prompt }],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[ai] API error", res.status, errBody);
      // Map các lỗi thường gặp sang message tiếng Việt
      if (res.status === 401) {
        return { ok: false, error: "API key không hợp lệ. Kiểm tra ANTHROPIC_API_KEY." };
      }
      if (res.status === 429) {
        return { ok: false, error: "Vượt giới hạn rate limit hoặc hết credit. Thử lại sau." };
      }
      if (res.status === 400) {
        return { ok: false, error: "Yêu cầu không hợp lệ (có thể prompt quá dài)." };
      }
      return { ok: false, error: `Lỗi API Claude (${res.status})` };
    }

    const data = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };

    // Gộp các text block
    const text = data.content
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text!)
      .join("")
      .trim();

    if (!text) {
      return { ok: false, error: "Claude trả về nội dung rỗng" };
    }

    return {
      ok: true,
      text,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error("[ai] callClaude exception", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, error: "Yêu cầu AI quá lâu (timeout 60s). Thử lại." };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi gọi AI",
    };
  }
}

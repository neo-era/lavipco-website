"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  settingsInputSchema,
  type SettingsInput,
  SETTING_KEYS,
  SETTINGS_DEFAULTS,
} from "@/lib/validations/admin-setting";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

/**
 * Load tất cả settings từ DB → return object key/value flatten.
 * Caller dùng để init form defaultValues.
 */
export async function loadSettings(): Promise<SettingsInput> {
  const rows = await db.setting.findMany({
    where: { key: { in: SETTING_KEYS as string[] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  // Parse từ string ← JSON nếu là boolean/number
  function parseValue<T>(key: keyof SettingsInput, fallback: T): T {
    const raw = map.get(key as string);
    if (raw === undefined || raw === null) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed as T;
    } catch {
      // raw không phải JSON valid (vd string thuần) → trả nguyên
      return raw as unknown as T;
    }
  }

  // Reconstruct với defaults (SETTINGS_DEFAULTS - không qua schema vì empty)
  const result: Record<string, unknown> = { ...SETTINGS_DEFAULTS };

  for (const key of SETTING_KEYS) {
    const fallback = SETTINGS_DEFAULTS[key];
    result[key] = parseValue(key, fallback);
  }

  return result as SettingsInput;
}

export async function updateSettings(
  input: Partial<SettingsInput>,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  // Merge với existing để validate đầy đủ (vd partial submit của 1 tab)
  const existing = await loadSettings();
  const merged = { ...existing, ...input };

  const parsed = settingsInputSchema.safeParse(merged);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // Upsert mỗi field thành 1 row Setting
    // Value lưu dưới dạng JSON.stringify để giữ type (bool/number/string)
    const entries = Object.entries(parsed.data) as [
      keyof SettingsInput,
      unknown,
    ][];

    await db.$transaction(
      entries.map(([key, value]) =>
        db.setting.upsert({
          where: { key: key as string },
          create: { key: key as string, value: JSON.stringify(value) },
          update: { value: JSON.stringify(value) },
        }),
      ),
    );

    revalidatePath("/admin/settings");
    revalidatePath("/"); // settings ảnh hưởng tới site config public
    return { ok: true };
  } catch (error) {
    console.error("[updateSettings]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

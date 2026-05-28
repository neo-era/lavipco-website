/**
 * Đọc nội dung trang (CMS) cho component public.
 * Defensive: thiếu key / JSON hỏng / validate fail → trả CONTENT_DEFAULTS[key].
 * Trang KHÔNG bao giờ vỡ vì lỗi dữ liệu.
 */
import type { z } from "zod";

import { db } from "@/lib/db";
import { contentSchemas, type ContentKey, type ContentValue } from "./schema";
import { CONTENT_DEFAULTS } from "./defaults";

export async function getContent<K extends ContentKey>(
  key: K,
): Promise<ContentValue<K>> {
  const fallback = CONTENT_DEFAULTS[key];
  try {
    const row = await db.setting.findUnique({ where: { key } });
    if (!row?.value) return fallback;

    const parsed: unknown = JSON.parse(row.value);
    const schema = contentSchemas[key] as unknown as z.ZodType<ContentValue<K>>;
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export async function getHomeContent() {
  const [hero, about, servicesHeader, why, cta] = await Promise.all([
    getContent("home_hero"),
    getContent("home_about"),
    getContent("home_services_header"),
    getContent("home_why"),
    getContent("home_cta"),
  ]);
  return { hero, about, servicesHeader, why, cta };
}

export async function getAboutContent() {
  const [hero, story, vmv, timeline, leadership, certs, partners, cta] =
    await Promise.all([
      getContent("about_hero"),
      getContent("about_story"),
      getContent("about_vmv"),
      getContent("about_timeline"),
      getContent("about_leadership"),
      getContent("about_certs"),
      getContent("about_partners"),
      getContent("about_cta"),
    ]);
  return { hero, story, vmv, timeline, leadership, certs, partners, cta };
}

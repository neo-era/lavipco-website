/**
 * Động cơ import dùng chung: đọc workbook → từng dòng validate Zod → upsert theo slug.
 * - dryRun=true: chỉ validate (preview), không ghi DB.
 * - 1 dòng lỗi KHÔNG làm hỏng cả file; báo lý do từng dòng.
 * Chỉ chạy phía server (dùng Buffer + exceljs).
 */
import type { z } from "zod";

import { readWorkbook, sheetToRows } from "./parse";
import type { EntityImportConfig, ImportResult } from "./types";

export type RunImportOptions<T> = {
  base64: string;
  config: EntityImportConfig;
  schema: z.ZodTypeAny;
  dryRun: boolean;
  /** Trả true nếu slug đã tồn tại (để phân loại tạo mới / cập nhật). */
  slugExists: (slug: string) => Promise<boolean>;
  /**
   * Validate bổ sung sau Zod (chạy cả preview lẫn import) — vd kiểm tra danh mục
   * tồn tại. Trả mảng lý do lỗi, hoặc null nếu hợp lệ.
   */
  validateExtra?: (data: T) => Promise<string[] | null>;
  /** Ghi DB (chỉ gọi khi dryRun=false). */
  upsert?: (data: T, slug: string, exists: boolean) => Promise<void>;
};

export async function runImport<T>(opts: RunImportOptions<T>): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, errors: 0, rows: [] };

  let workbook;
  try {
    const buffer = Buffer.from(opts.base64, "base64");
    workbook = await readWorkbook(buffer);
  } catch {
    return {
      created: 0,
      updated: 0,
      errors: 1,
      rows: [{ rowIndex: 0, action: "error", messages: ["Không đọc được file (.xlsx hợp lệ?)"] }],
    };
  }

  const ws =
    workbook.getWorksheet(opts.config.sheetName) ?? workbook.worksheets[0];
  if (!ws) {
    return {
      created: 0,
      updated: 0,
      errors: 1,
      rows: [{ rowIndex: 0, action: "error", messages: ["Không tìm thấy sheet dữ liệu"] }],
    };
  }

  const rows = sheetToRows(ws, opts.config.columns);

  const MAX_ROWS = 1000;
  if (rows.length > MAX_ROWS) {
    return {
      created: 0,
      updated: 0,
      errors: 1,
      rows: [
        {
          rowIndex: 0,
          action: "error",
          messages: [`Quá ${MAX_ROWS} dòng/lần (${rows.length}). Chia nhỏ file rồi import lại.`],
        },
      ],
    };
  }

  const seen = new Set<string>();

  for (const { rowIndex, data: raw } of rows) {
    const candidate = opts.config.parseRow(raw);
    const parsed = opts.schema.safeParse(candidate);
    if (!parsed.success) {
      result.errors++;
      result.rows.push({
        rowIndex,
        action: "error",
        messages: parsed.error.issues.map(
          (i) => `${i.path.join(".") || "?"}: ${i.message}`,
        ),
      });
      continue;
    }

    const data = parsed.data as T;
    const slug = String((parsed.data as Record<string, unknown>).slug ?? "");
    if (seen.has(slug)) {
      result.errors++;
      result.rows.push({ rowIndex, action: "error", slug, messages: ["Slug trùng trong file"] });
      continue;
    }
    seen.add(slug);

    if (opts.validateExtra) {
      const extra = await opts.validateExtra(data);
      if (extra && extra.length > 0) {
        result.errors++;
        result.rows.push({ rowIndex, action: "error", slug, messages: extra });
        continue;
      }
    }

    let exists = false;
    try {
      exists = await opts.slugExists(slug);
      if (!opts.dryRun && opts.upsert) {
        await opts.upsert(data, slug, exists);
      }
    } catch (e) {
      result.errors++;
      result.rows.push({
        rowIndex,
        action: "error",
        slug,
        messages: [e instanceof Error ? e.message : "Lỗi ghi dữ liệu"],
      });
      continue;
    }

    if (exists) {
      result.updated++;
      result.rows.push({ rowIndex, action: "update", slug });
    } else {
      result.created++;
      result.rows.push({ rowIndex, action: "create", slug });
    }
  }

  return result;
}

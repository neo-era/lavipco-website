/**
 * Đọc file Excel (.xlsx) bằng exceljs + helper decode ô.
 * Dùng phía server (Node) — nhận Buffer.
 */
import ExcelJS from "exceljs";

import type { ColumnSpec } from "./types";

export async function readWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  // Cast: @types/node Buffer (generic) vs exceljs Buffer typing lệch nhau.
  await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
  return wb;
}

/** Chuyển giá trị 1 ô exceljs về chuỗi (xử lý richText/hyperlink/formula/number/date). */
export function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const v = value as unknown as Record<string, unknown>;
    if ("text" in v && typeof v.text === "string") return v.text.trim();
    if ("result" in v) return cellToString(v.result as ExcelJS.CellValue);
    if ("richText" in v && Array.isArray(v.richText)) {
      return (v.richText as { text: string }[]).map((r) => r.text).join("").trim();
    }
    if ("hyperlink" in v && typeof v.hyperlink === "string") return v.hyperlink.trim();
  }
  return String(value).trim();
}

/**
 * Map các dòng dữ liệu (bỏ dòng header) thành object field→string.
 * Header lấy ở dòng 1, khớp theo `ColumnSpec.header`.
 */
export function sheetToRows(
  ws: ExcelJS.Worksheet,
  columns: ColumnSpec[],
): { rowIndex: number; data: Record<string, string> }[] {
  const headerRow = ws.getRow(1);
  const colToField = new Map<number, string>();
  headerRow.eachCell((cell, colNumber) => {
    const header = cellToString(cell.value);
    const spec = columns.find((c) => c.header === header);
    if (spec) colToField.set(colNumber, spec.field);
  });

  const out: { rowIndex: number; data: Record<string, string> }[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // bỏ header
    const data: Record<string, string> = {};
    let hasAny = false;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const field = colToField.get(colNumber);
      if (!field) return;
      const val = cellToString(cell.value);
      data[field] = val;
      if (val) hasAny = true;
    });
    if (hasAny) out.push({ rowIndex: rowNumber, data });
  });
  return out;
}

// ====================================================================
// Decode helpers — quy ước mã hoá ô (xem sheet "Hướng dẫn" file mẫu)
// ====================================================================

/** Mảng chuỗi: ngăn cách bằng xuống dòng hoặc dấu `|`. */
export function splitList(cell: string | undefined): string[] {
  if (!cell) return [];
  return cell
    .split(/[\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Boolean: 1/true/có/x/yes → true; còn lại false. */
export function parseBool(cell: string | undefined): boolean {
  if (!cell) return false;
  return /^(1|true|có|co|x|yes|y)$/i.test(cell.trim());
}

/** Ngày: ISO yyyy-mm-dd hoặc dd/MM/yyyy → ISO string; không parse được → null. */
export function parseDate(cell: string | undefined): string | null {
  if (!cell) return null;
  const s = cell.trim();
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = new Date(s);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/** Số nguyên không âm; rỗng/không hợp lệ → undefined. */
export function parseIntOrUndef(cell: string | undefined): number | undefined {
  if (!cell) return undefined;
  const n = Number(cell.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

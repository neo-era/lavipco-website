/**
 * Sinh file Excel mẫu (.xlsx) từ EntityImportConfig bằng exceljs.
 * Gồm: sheet dữ liệu (header style brand + freeze + ví dụ) + sheet "Hướng dẫn".
 */
import ExcelJS from "exceljs";

import type { EntityImportConfig, ExtraSheet } from "./types";

const BRAND_ARGB = "FF0B5FA5";

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND_ARGB },
  };
  row.alignment = { vertical: "middle" };
}

export async function buildTemplate(
  config: EntityImportConfig,
  opts?: { extraSheets?: ExtraSheet[] },
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "LAVIPCO Admin";
  wb.created = new Date();

  // --- Sheet dữ liệu ---
  const ws = wb.addWorksheet(config.sheetName);
  ws.columns = config.columns.map((c) => ({
    header: c.header,
    key: c.field,
    width: Math.max(16, Math.min(40, c.header.length + 6)),
  }));
  styleHeaderRow(ws.getRow(1));
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // 2 dòng ví dụ (từ ColumnSpec.example)
  for (let i = 0; i < 2; i++) {
    const rowData: Record<string, string> = {};
    for (const c of config.columns) rowData[c.field] = c.example ?? "";
    ws.addRow(rowData);
  }

  // --- Sheet Hướng dẫn ---
  const guide = wb.addWorksheet("Hướng dẫn");
  guide.columns = [
    { header: "Cột", key: "header", width: 28 },
    { header: "Bắt buộc", key: "required", width: 10 },
    { header: "Giải thích", key: "note", width: 64 },
  ];
  styleHeaderRow(guide.getRow(1));
  for (const c of config.columns) {
    guide.addRow({
      header: c.header,
      required: c.required ? "Có" : "",
      note: c.note ?? "",
    });
  }
  guide.addRow({});
  guide.addRow({
    header: "QUY ƯỚC",
    required: "",
    note: "Ảnh: dán URL (không nhúng file). Mảng (ảnh/tags): mỗi dòng 1 phần tử hoặc ngăn cách bằng |. Boolean: 1/0, có/không, x. Dòng có cùng slug đã tồn tại sẽ được CẬP NHẬT.",
  });
  guide.getColumn("note").alignment = { wrapText: true, vertical: "top" };

  // --- Sheet phụ (vd danh sách danh mục) ---
  if (opts?.extraSheets) {
    for (const s of opts.extraSheets) {
      const extra = wb.addWorksheet(s.name);
      extra.columns = s.columns.map((c) => ({
        header: c.header,
        key: c.key,
        width: c.width ?? 28,
      }));
      styleHeaderRow(extra.getRow(1));
      for (const r of s.rows) extra.addRow(r);
    }
  }

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}

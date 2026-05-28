/**
 * Kiểu dùng chung cho động cơ import/export Excel (Giai đoạn 9).
 */

/** Một cột trong file Excel + cách map sang field dữ liệu. */
export type ColumnSpec = {
  header: string;
  field: string;
  required?: boolean;
  example?: string;
  note?: string;
};

/** Cấu hình import cho 1 entity. `parseRow` chuyển 1 dòng Excel thô → object để validate. */
export type EntityImportConfig = {
  /** Tên entity dùng cho route + tên file mẫu. */
  key: string;
  /** Nhãn hiển thị (tiếng Việt). */
  label: string;
  /** Tên sheet dữ liệu trong file Excel. */
  sheetName: string;
  columns: ColumnSpec[];
  /** Chuyển dòng thô (field→string) thành object đầu vào để validate bằng Zod. */
  parseRow: (raw: Record<string, string>) => Record<string, unknown>;
};

/** Kết quả xử lý 1 dòng. */
export type RowResult = {
  rowIndex: number;
  action: "create" | "update" | "error";
  slug?: string;
  messages?: string[];
};

/** Kết quả tổng hợp 1 lần preview/import. */
export type ImportResult = {
  created: number;
  updated: number;
  errors: number;
  rows: RowResult[];
};

/** Sheet phụ (vd: danh sách slug danh mục) khi sinh file mẫu. */
export type ExtraSheet = {
  name: string;
  columns: { header: string; key: string; width?: number }[];
  rows: Record<string, unknown>[];
};

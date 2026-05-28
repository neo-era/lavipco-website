/**
 * GET /api/admin/templates/[entity] — tải file Excel mẫu cho import.
 * Require ADMIN. entity ∈ products | projects | services | blog.
 */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildTemplate } from "@/lib/excel/template";
import { getImportConfig } from "@/lib/excel/configs";
import type { ExtraSheet } from "@/lib/excel/types";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { entity } = await params;
  const config = getImportConfig(entity);
  if (!config) {
    return new Response("Entity chưa hỗ trợ import", { status: 404 });
  }

  // Sản phẩm: nhúng sheet phụ liệt kê slug danh mục hiện có
  let extraSheets: ExtraSheet[] | undefined;
  if (entity === "products") {
    const categories = await db.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    });
    extraSheets = [
      {
        name: "Danh mục",
        columns: [
          { header: "Slug danh mục", key: "slug", width: 30 },
          { header: "Tên danh mục", key: "name", width: 36 },
        ],
        rows: categories,
      },
    ];
  }

  const buffer = await buildTemplate(config, { extraSheets });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": XLSX_MIME,
      "Content-Disposition": `attachment; filename="mau-${entity}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

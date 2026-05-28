import { NextResponse } from "next/server";

import { getWards } from "@/lib/regions";

/**
 * GET /api/regions/wards?provinceCode=XXX
 * Trả về list phường/xã thuộc tỉnh/thành đó (cấu trúc 2 cấp sau sáp nhập).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const provinceCode = url.searchParams.get("provinceCode") ?? undefined;

  if (!provinceCode) {
    return NextResponse.json({ error: "Thiếu provinceCode" }, { status: 400 });
  }

  return NextResponse.json(getWards(provinceCode), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

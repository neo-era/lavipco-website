import { NextResponse } from "next/server";

import { getDistricts } from "@/lib/regions";

/**
 * GET /api/regions/districts?provinceCode=XX
 * Trả về list huyện/quận thuộc tỉnh đó.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const provinceCode = url.searchParams.get("provinceCode") ?? undefined;

  if (!provinceCode) {
    return NextResponse.json(
      { error: "Thiếu provinceCode" },
      { status: 400 },
    );
  }

  return NextResponse.json(getDistricts(provinceCode), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

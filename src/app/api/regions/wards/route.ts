import { NextResponse } from "next/server";

import { getWards } from "@/lib/regions";

/**
 * GET /api/regions/wards?districtCode=XXX
 * Trả về list phường/xã thuộc huyện đó.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const districtCode = url.searchParams.get("districtCode") ?? undefined;

  if (!districtCode) {
    return NextResponse.json(
      { error: "Thiếu districtCode" },
      { status: 400 },
    );
  }

  return NextResponse.json(getWards(districtCode), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

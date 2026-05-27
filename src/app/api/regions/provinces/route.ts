import { NextResponse } from "next/server";

import { getProvinces } from "@/lib/regions";

/**
 * GET /api/regions/provinces
 * Trả về list 63 tỉnh/thành (hiện sample 7 tỉnh, xem TODO ở data.ts).
 * Cache 1h: data tỉnh hiếm đổi.
 */
export async function GET() {
  return NextResponse.json(getProvinces(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

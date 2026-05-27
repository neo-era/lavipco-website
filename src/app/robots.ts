/**
 * robots.txt động.
 *
 * Cho phép crawl toàn bộ public, chặn /admin, /api, /account, /checkout, /cart.
 * Sitemap URL được generate động ở /sitemap.xml.
 */
import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/constants";

const BASE = SITE_CONFIG.url.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account",
          "/account/",
          "/checkout",
          "/checkout/",
          "/cart",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

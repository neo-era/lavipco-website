/**
 * Sitemap động cho toàn bộ trang public.
 *
 * Next.js built-in: file này export default → /sitemap.xml endpoint.
 * Render mỗi request (force-dynamic) hoặc cache theo `revalidate` (set bên dưới).
 *
 * Include:
 *  - Trang tĩnh: /, /about, /services, /projects, /products, /contact, /blog
 *  - Sản phẩm ACTIVE
 *  - Dự án (mọi)
 *  - Dịch vụ isActive
 *  - Blog posts đã publish (isPublished=true)
 *
 * lastModified lấy từ updatedAt (DB) hoặc fallback now.
 */
import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/constants";

export const revalidate = 3600; // 1 giờ

const BASE = SITE_CONFIG.url.replace(/\/$/, "");

function abs(path: string): string {
  return `${BASE}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Trang tĩnh - priority cao
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: abs("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: abs("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: abs("/services"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: abs("/projects"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: abs("/products"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: abs("/blog"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: abs("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic data - chạy song song
  const [products, projects, services, posts] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    db.project.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.service.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: abs(`/products/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: abs(`/projects/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: abs(`/services/${s.slug}`),
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: abs(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productEntries,
    ...projectEntries,
    ...serviceEntries,
    ...blogEntries,
  ];
}

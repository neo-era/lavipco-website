"use server";

/**
 * Tìm kiếm sản phẩm theo từ khoá.
 * - Tìm trong: name, nameNoAccent, slug, shortDescription, description, brand
 * - Case-insensitive `contains` (Prisma `mode: "insensitive"`)
 * - Chỉ trả sản phẩm ACTIVE
 *
 * Hỗ trợ tiếng Việt có dấu/không dấu:
 *   Khi user gõ "den" → query thêm field `nameNoAccent` (đã lowercase +
 *   bỏ dấu) → trúng "Đèn LED..." (nameNoAccent="den led..."). Field
 *   nameNoAccent được auto-fill ở seed/admin CRUD bằng
 *   removeVietnameseAccents() từ @/lib/utils.
 */
import { db } from "@/lib/db";
import { removeVietnameseAccents } from "@/lib/utils";

export type SearchProductResult = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  basePrice: number;
  priceOnRequest: boolean;
  image: string | null;
};

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

export async function searchProducts(
  query: string,
  limit: number = DEFAULT_LIMIT,
): Promise<SearchProductResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const take = Math.max(1, Math.min(MAX_LIMIT, limit));
  const qNoAccent = removeVietnameseAccents(q);

  const products = await db.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        // nameNoAccent đã lowercase + bỏ dấu → contains insensitive cũng OK
        { nameNoAccent: { contains: qNoAccent, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    take,
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      basePrice: true,
      priceOnRequest: true,
      images: true,
    },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    basePrice: Number(p.basePrice),
    priceOnRequest: p.priceOnRequest,
    image: p.images[0] ?? null,
  }));
}

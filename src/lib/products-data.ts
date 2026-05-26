/**
 * Helpers cho catalog sản phẩm: parse URL filter, sort options, page size.
 */
import type { Prisma } from "@prisma/client";

export const PRODUCTS_PAGE_SIZE = 12;

/** Số ngày để sản phẩm còn được coi là "Mới" (badge). */
export const NEW_PRODUCT_DAYS = 30;

// ====================================================================
// Sort options
// ====================================================================

export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "featured", label: "Nổi bật" },
] as const;

export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: ProductSort = "newest";

export function parseSort(value: string | undefined): ProductSort {
  const valid = PRODUCT_SORT_OPTIONS.map((o) => o.value) as readonly string[];
  if (value && valid.includes(value)) return value as ProductSort;
  return DEFAULT_SORT;
}

/** Map sort key → Prisma orderBy. */
export function getOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ basePrice: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { createdAt: "desc" }];
    case "featured":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

// ====================================================================
// View mode
// ====================================================================

export const VIEW_MODES = ["grid", "list"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export function parseViewMode(value: string | undefined): ViewMode {
  return value === "list" ? "list" : "grid";
}

// ====================================================================
// Filters
// ====================================================================

export type ProductFilters = {
  category: string | null; // category slug
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  q: string | null; // search query
};

export function parseFilters(searchParams: Record<string, string | undefined>): ProductFilters {
  const brandsRaw = searchParams.brand;
  const brands = brandsRaw ? brandsRaw.split(",").filter(Boolean) : [];

  const minPriceN = Number(searchParams.minPrice);
  const maxPriceN = Number(searchParams.maxPrice);

  return {
    category: searchParams.category || null,
    brands,
    minPrice: Number.isFinite(minPriceN) && minPriceN > 0 ? minPriceN : null,
    maxPrice: Number.isFinite(maxPriceN) && maxPriceN > 0 ? maxPriceN : null,
    q: searchParams.q || null,
  };
}

/**
 * Build URL `/products?...` từ filter + sort + view + page.
 * Loại bỏ các key có giá trị default để URL gọn.
 */
export function buildProductsUrl(opts: {
  filters?: Partial<ProductFilters>;
  sort?: ProductSort;
  view?: ViewMode;
  page?: number;
}): string {
  const params = new URLSearchParams();
  const { filters = {}, sort, view, page } = opts;

  if (filters.category) params.set("category", filters.category);
  if (filters.brands && filters.brands.length > 0) {
    params.set("brand", filters.brands.join(","));
  }
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.q) params.set("q", filters.q);
  if (sort && sort !== DEFAULT_SORT) params.set("sort", sort);
  if (view && view !== "grid") params.set("view", view);
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

// ====================================================================
// Helper: kiểm tra "Mới"
// ====================================================================

export function isNewProduct(createdAt: Date): boolean {
  const days = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return days <= NEW_PRODUCT_DAYS;
}

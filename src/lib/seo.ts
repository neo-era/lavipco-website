/**
 * SEO utilities: build JSON-LD schemas + sanitize HTML cho meta description.
 *
 * Mọi schema return object plain — caller wrap qua <JsonLd data={schema} />
 * component (xem components/common/JsonLd.tsx).
 *
 * Tham khảo: https://schema.org/docs/full.html + Google Rich Results guidelines.
 */
import { SITE_CONFIG } from "@/lib/constants";

const SITE_URL = SITE_CONFIG.url;

/**
 * Strip HTML tags + trim cho meta description.
 * Đảm bảo description không vượt 320 ký tự, không có HTML markup.
 */
export function stripHtmlForMeta(input: string | null | undefined, maxLen = 160): string {
  if (!input) return "";
  // Remove HTML tags + collapse whitespace
  const text = input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

/** Build URL tuyệt đối từ pathname tương đối. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  return base + (path.startsWith("/") ? path : "/" + path);
}

// ======================================================
// Organization schema (root layout)
// ======================================================

export function buildOrganizationSchema(): Record<string, unknown> {
  const sameAs: string[] = [];
  if (SITE_CONFIG.social.facebook) sameAs.push(SITE_CONFIG.social.facebook);
  if (SITE_CONFIG.social.youtube) sameAs.push(SITE_CONFIG.social.youtube);
  if (SITE_CONFIG.social.zalo) sameAs.push(SITE_CONFIG.social.zalo);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_CONFIG.fullName,
    alternateName: SITE_CONFIG.name,
    url: SITE_URL,
    logo: absoluteUrl("/images/logo.png"),
    description: SITE_CONFIG.description,
  };

  if (SITE_CONFIG.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address,
      addressCountry: "VN",
    };
  }

  if (SITE_CONFIG.hotline || SITE_CONFIG.email) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(SITE_CONFIG.hotline ? { telephone: SITE_CONFIG.hotline } : {}),
      ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
      areaServed: "VN",
      availableLanguage: ["Vietnamese"],
    };
  }

  if (SITE_CONFIG.taxCode) {
    schema.taxID = SITE_CONFIG.taxCode;
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}

// ======================================================
// WebSite schema (search box)
// ======================================================

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: SITE_URL,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/products?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ======================================================
// BreadcrumbList schema
// ======================================================

export type BreadcrumbItem = {
  /** Tên hiển thị. */
  name: string;
  /** URL tương đối hoặc tuyệt đối. Item cuối có thể không có URL. */
  url?: string;
};

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

// ======================================================
// Product schema
// ======================================================

export type ProductSchemaInput = {
  name: string;
  description: string;
  slug: string;
  images: string[];
  brand: string | null;
  sku?: string;
  basePrice: number;
  priceOnRequest: boolean;
  /** Tổng tồn kho - dùng cho availability. */
  totalStock: number;
};

export function buildProductSchema(
  input: ProductSchemaInput,
): Record<string, unknown> {
  const url = absoluteUrl(`/products/${input.slug}`);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: stripHtmlForMeta(input.description, 5000),
    image: input.images.map((img) =>
      img.startsWith("data:") ? absoluteUrl("/images/og-default.jpg") : img,
    ),
    url,
    ...(input.brand
      ? { brand: { "@type": "Brand", name: input.brand } }
      : {}),
    ...(input.sku ? { sku: input.sku } : {}),
  };

  // Offers (chỉ thêm khi không phải priceOnRequest và có giá)
  if (!input.priceOnRequest && input.basePrice > 0) {
    schema.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "VND",
      price: String(input.basePrice),
      availability:
        input.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.fullName,
      },
    };
  } else if (input.priceOnRequest) {
    // Cho phép hiển thị nhưng đánh dấu là báo giá
    schema.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "VND",
      price: "0",
      availability: "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.fullName,
      },
    };
  }

  return schema;
}

// ======================================================
// Article schema (blog post)
// ======================================================

export type ArticleSchemaInput = {
  title: string;
  description: string;
  slug: string;
  coverImage: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
};

export function buildArticleSchema(
  input: ArticleSchemaInput,
): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${input.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.coverImage
      ? [input.coverImage]
      : [absoluteUrl("/images/og-default.jpg")],
    datePublished: (input.publishedAt ?? input.updatedAt).toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.fullName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "vi-VN",
  };
}

// ======================================================
// Service schema
// ======================================================

export type ServiceSchemaInput = {
  title: string;
  description: string;
  slug: string;
  coverImage: string | null;
};

export function buildServiceSchema(
  input: ServiceSchemaInput,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.title,
    description: input.description,
    url: absoluteUrl(`/services/${input.slug}`),
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.fullName,
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "Vietnam" },
    ...(input.coverImage ? { image: input.coverImage } : {}),
  };
}

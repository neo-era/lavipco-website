/**
 * Sanitize HTML từ Tiptap editor trước khi render ở public page.
 * Bảo vệ XSS — chấp nhận chỉ tags + attributes whitelist.
 *
 * Dùng sanitize-html (thuần Node, không phụ thuộc jsdom) để chạy được cả ở
 * build lẫn runtime serverless (Vercel). isomorphic-dompurify kéo theo jsdom
 * gây lỗi ERR_REQUIRE_ESM trên runtime Vercel nên đã thay thế.
 */
import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

// Whitelist áp dụng cho mọi tag (giữ tương đương cấu hình DOMPurify cũ).
const ALLOWED_ATTR = [
  "href",
  "title",
  "alt",
  "src",
  "target",
  "rel",
  "class",
  "style",
];

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { "*": ALLOWED_ATTR },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Chặn data-* attributes (tương đương ALLOW_DATA_ATTR: false)
    allowedSchemesByTag: { img: ["http", "https"] },
  });
}

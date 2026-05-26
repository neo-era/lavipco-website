-- Migration: add_product_name_no_accent
-- Thêm field nameNoAccent vào Product để hỗ trợ search tiếng Việt không dấu
-- match có dấu (vd "den" match "Đèn..."). Field này được backfill cho rows
-- hiện có (rỗng default), sau đó seed script + admin CRUD sẽ auto-fill bằng
-- helper removeVietnameseAccents(name) ở src/lib/utils.ts.

ALTER TABLE "products" ADD COLUMN "nameNoAccent" TEXT NOT NULL DEFAULT '';

-- Index btree đơn giản để query EXACT match nhanh; cho contains ILIKE,
-- 5-1000 rows seed/dev không cần pg_trgm. Khi catalog vượt 10k rows,
-- cân nhắc bật pg_trgm extension + GIN index.
CREATE INDEX "products_nameNoAccent_idx" ON "products"("nameNoAccent");

-- Migration: rename_project_category_and_audit_fields
-- Đổi tên enum ProjectCategory (giữ data) và thêm createdAt/updatedAt
-- cho các bảng còn thiếu (addresses, categories, product_variants, order_items).
--
-- Cách an toàn cho enum: ALTER TYPE ... RENAME VALUE
-- (Postgres 10+, chỉ rename label, giữ nguyên id internal — không mất data).

-- 1. Rename ProjectCategory enum values
ALTER TYPE "ProjectCategory" RENAME VALUE 'SMART_LIGHTING'  TO 'URBAN_LIGHTING';
ALTER TYPE "ProjectCategory" RENAME VALUE 'LANDSCAPE'       TO 'LANDSCAPE_LIGHTING';
ALTER TYPE "ProjectCategory" RENAME VALUE 'POWER_INFRA'     TO 'POWER_INFRASTRUCTURE';

-- 2. Thêm createdAt/updatedAt cho các bảng còn thiếu
--    DEFAULT CURRENT_TIMESTAMP để rows đã có không vi phạm NOT NULL.

ALTER TABLE "addresses"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "categories"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "product_variants"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "order_items"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migration: add_wishlist
-- Thêm model WishlistItem - quan hệ N-N giữa User và Product
-- (user yêu thích sản phẩm). Composite unique (userId, productId) đảm
-- bảo không trùng. Cascade delete khi user/product bị xoá.

CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON "wishlist_items"("userId", "productId");
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

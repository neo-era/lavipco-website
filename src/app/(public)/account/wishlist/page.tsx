import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  WishlistGrid,
  type WishlistItemView,
} from "@/components/account/WishlistGrid";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/wishlist");

  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          variants: {
            orderBy: [{ isDefault: "desc" }, { price: "asc" }],
            take: 1, // default variant để add to cart
          },
        },
      },
    },
  });

  const views: WishlistItemView[] = items
    .filter((it) => it.product.status === "ACTIVE")
    .map((it) => {
      const variant = it.product.variants[0];
      return {
        productId: it.product.id,
        slug: it.product.slug,
        name: it.product.name,
        brand: it.product.brand,
        basePrice: Number(it.product.basePrice),
        priceOnRequest: it.product.priceOnRequest,
        image: it.product.images[0] ?? null,
        createdAt: it.product.createdAt,
        variant: variant
          ? {
              id: variant.id,
              name: variant.name,
              price: Number(variant.price),
              stock: variant.stock,
            }
          : null,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Sản phẩm yêu thích</h1>
        <p className="mt-1 text-muted-foreground">
          {views.length === 0
            ? "Chưa có sản phẩm yêu thích."
            : `${views.length} sản phẩm trong danh sách yêu thích.`}
        </p>
      </div>

      <WishlistGrid items={views} />
    </div>
  );
}

"use server";

/**
 * Wishlist Server Actions.
 * Tất cả require login; guest user phải sign-in trước.
 */
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type WishlistActionResult = { ok: true } | { ok: false; error: string };

async function getUserIdOrThrow(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Bạn cần đăng nhập để dùng tính năng yêu thích");
  }
  return session.user.id;
}

export async function addToWishlist(productId: string): Promise<WishlistActionResult> {
  try {
    const userId = await getUserIdOrThrow();
    await db.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {}, // idempotent
      create: { userId, productId },
    });
    revalidatePath("/account/wishlist");
    return { ok: true };
  } catch (error) {
    console.error("[addToWishlist]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Không thêm được vào yêu thích",
    };
  }
}

export async function removeFromWishlist(productId: string): Promise<WishlistActionResult> {
  try {
    const userId = await getUserIdOrThrow();
    await db.wishlistItem.deleteMany({ where: { userId, productId } });
    revalidatePath("/account/wishlist");
    return { ok: true };
  } catch (error) {
    console.error("[removeFromWishlist]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Không xoá được",
    };
  }
}

/**
 * Toggle: nếu đã có → remove, chưa có → add. Trả về trạng thái mới.
 */
export async function toggleWishlist(
  productId: string,
): Promise<{ ok: true; isInWishlist: boolean } | { ok: false; error: string }> {
  try {
    const userId = await getUserIdOrThrow();
    const existing = await db.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/account/wishlist");
      return { ok: true, isInWishlist: false };
    }

    await db.wishlistItem.create({ data: { userId, productId } });
    revalidatePath("/account/wishlist");
    return { ok: true, isInWishlist: true };
  } catch (error) {
    console.error("[toggleWishlist]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi",
    };
  }
}

/**
 * Kiểm tra product có trong wishlist của user hiện tại không.
 * Dùng để hiển thị heart icon filled/empty trên ProductCard/Info.
 * Trả null nếu user chưa login (caller render heart trống + redirect khi click).
 */
export async function isInWishlist(productId: string): Promise<boolean | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
    select: { id: true },
  });
  return Boolean(item);
}

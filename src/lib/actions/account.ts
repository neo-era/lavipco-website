"use server";

/**
 * Server Actions cho /account.
 */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ReorderItem = {
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  image: string | null;
};

export type ReorderResult =
  | {
      ok: true;
      items: ReorderItem[];
      /** Variants không còn ACTIVE/đủ stock — caller toast cảnh báo. */
      unavailable: Array<{ productName: string; reason: string }>;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Lấy items từ đơn hàng cũ + check stock thực tế → trả về list để client
 * (CartStore) addItem từng cái. Variant không còn ACTIVE/đủ stock sẽ bị
 * loại + thêm vào `unavailable` để toast warning.
 */
export async function reorderItems(orderCode: string): Promise<ReorderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Bạn cần đăng nhập để đặt lại đơn." };
  }

  const order = await db.order.findUnique({
    where: { code: orderCode },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  status: true,
                  images: true,
                  priceOnRequest: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng." };

  // Verify ownership
  const ownsOrder =
    order.userId === session.user.id ||
    (order.guestEmail && session.user.email === order.guestEmail);
  if (!ownsOrder) {
    return { ok: false, error: "Bạn không có quyền truy cập đơn hàng này." };
  }

  const items: ReorderItem[] = [];
  const unavailable: Array<{ productName: string; reason: string }> = [];

  for (const item of order.items) {
    const product = item.variant.product;
    if (product.status !== "ACTIVE") {
      unavailable.push({ productName: item.productName, reason: "Đã ngừng kinh doanh" });
      continue;
    }
    if (product.priceOnRequest) {
      unavailable.push({
        productName: item.productName,
        reason: "Sản phẩm yêu cầu báo giá",
      });
      continue;
    }
    if (item.variant.stock < item.quantity) {
      if (item.variant.stock === 0) {
        unavailable.push({ productName: item.productName, reason: "Hết hàng" });
        continue;
      }
      // Giảm về stock còn lại + cảnh báo
      unavailable.push({
        productName: item.productName,
        reason: `Chỉ còn ${item.variant.stock}, đã thêm số lượng tối đa`,
      });
    }

    const quantity = Math.min(item.quantity, item.variant.stock);
    if (quantity === 0) continue;

    items.push({
      productVariantId: item.variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: item.variant.name,
      unitPrice: Number(item.variant.price),
      quantity,
      maxStock: item.variant.stock,
      image: product.images[0] ?? null,
    });
  }

  if (items.length === 0) {
    return {
      ok: false,
      error: "Tất cả sản phẩm trong đơn này đã không còn khả dụng.",
    };
  }

  return { ok: true, items, unavailable };
}

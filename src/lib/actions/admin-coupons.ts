"use server";

/**
 * Admin coupon CRUD.
 */
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  couponInputSchema,
  type CouponInput,
} from "@/lib/validations/admin-coupon";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

export async function createCoupon(
  input: CouponInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }
  const data = parsed.data;

  try {
    const exists = await db.coupon.findUnique({
      where: { code: data.code },
      select: { id: true },
    });
    if (exists) {
      return {
        ok: false,
        error: "Mã đã tồn tại",
        fieldErrors: { code: ["Mã này đã được tạo trước đó"] },
      };
    }

    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        description: data.description ?? null,
        type: data.type,
        value: new Prisma.Decimal(data.value),
        minOrderValue:
          data.minOrderValue !== undefined && data.minOrderValue !== null
            ? new Prisma.Decimal(data.minOrderValue)
            : null,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive,
      },
      select: { id: true },
    });

    revalidatePath("/admin/coupons");
    return { ok: true, data: coupon };
  } catch (error) {
    console.error("[createCoupon]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi tạo coupon",
    };
  }
}

export async function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }
  const data = parsed.data;

  try {
    const existing = await db.coupon.findUnique({
      where: { id },
      select: { id: true, code: true, usedCount: true },
    });
    if (!existing) return { ok: false, error: "Không tìm thấy coupon" };

    // Nếu đổi code → check unique
    if (data.code !== existing.code) {
      const conflict = await db.coupon.findUnique({
        where: { code: data.code },
        select: { id: true },
      });
      if (conflict) {
        return {
          ok: false,
          error: "Mã đã tồn tại ở coupon khác",
          fieldErrors: { code: ["Mã này đã có"] },
        };
      }
    }

    // Nếu usageLimit < usedCount → reject
    if (data.usageLimit !== null && data.usageLimit !== undefined) {
      if (data.usageLimit < existing.usedCount) {
        return {
          ok: false,
          error: `Giới hạn sử dụng (${data.usageLimit}) không thể nhỏ hơn số đã dùng (${existing.usedCount})`,
          fieldErrors: {
            usageLimit: [`Đã có ${existing.usedCount} lượt dùng, không thể giảm thấp hơn`],
          },
        };
      }
    }

    await db.coupon.update({
      where: { id },
      data: {
        code: data.code,
        description: data.description ?? null,
        type: data.type,
        value: new Prisma.Decimal(data.value),
        minOrderValue:
          data.minOrderValue !== undefined && data.minOrderValue !== null
            ? new Prisma.Decimal(data.minOrderValue)
            : null,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (error) {
    console.error("[updateCoupon]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật coupon",
    };
  }
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const coupon = await db.coupon.findUnique({
      where: { id },
      select: { code: true, usedCount: true },
    });
    if (!coupon) return { ok: false, error: "Không tìm thấy coupon" };

    // Cảnh báo nếu đã có người dùng — nhưng vẫn cho xoá (admin chủ động)
    // Nếu muốn ngăn cứng thì uncomment:
    // if (coupon.usedCount > 0) {
    //   return { ok: false, error: "Coupon đã được sử dụng, không thể xoá. Hãy tắt isActive thay vì xoá." };
    // }

    await db.coupon.delete({ where: { id } });

    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (error) {
    console.error("[deleteCoupon]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi xoá coupon",
    };
  }
}

export async function toggleCouponActive(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  try {
    const coupon = await db.coupon.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!coupon) return { ok: false, error: "Không tìm thấy coupon" };

    await db.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (error) {
    console.error("[toggleCouponActive]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật",
    };
  }
}

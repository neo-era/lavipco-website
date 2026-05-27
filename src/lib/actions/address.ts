"use server";

/**
 * CRUD địa chỉ cho /account/addresses.
 * Tất cả action require user login + match userId từ session.
 */
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema, type AddressInput } from "@/lib/validations/address";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireUser(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Bạn cần đăng nhập");
  return session.user.id;
}

export async function createAddress(input: AddressInput): Promise<ActionResult<{ id: string }>> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu không hợp lệ", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const userId = await requireUser();

    // Nếu isDefault → unset default cũ
    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Nếu user chưa có địa chỉ nào → auto set default
    const existingCount = await db.address.count({ where: { userId } });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    const address = await db.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        province: data.provinceName,
        district: data.districtName,
        ward: data.wardName,
        street: data.street,
        provinceCode: data.provinceCode,
        districtCode: data.districtCode,
        wardCode: data.wardCode,
        isDefault: shouldBeDefault,
      },
      select: { id: true },
    });

    revalidatePath("/account/addresses");
    return { ok: true, data: { id: address.id } };
  } catch (error) {
    console.error("[createAddress]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi tạo địa chỉ" };
  }
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<ActionResult> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu không hợp lệ", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const userId = await requireUser();

    // Verify ownership
    const existing = await db.address.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== userId) {
      return { ok: false, error: "Không tìm thấy địa chỉ" };
    }

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    await db.address.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        province: data.provinceName,
        district: data.districtName,
        ward: data.wardName,
        street: data.street,
        provinceCode: data.provinceCode,
        districtCode: data.districtCode,
        wardCode: data.wardCode,
        isDefault: data.isDefault ?? false,
      },
    });

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    console.error("[updateAddress]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi cập nhật địa chỉ" };
  }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUser();

    const existing = await db.address.findUnique({
      where: { id },
      select: { userId: true, isDefault: true },
    });
    if (!existing || existing.userId !== userId) {
      return { ok: false, error: "Không tìm thấy địa chỉ" };
    }

    await db.address.delete({ where: { id } });

    // Nếu vừa xoá địa chỉ mặc định, set 1 địa chỉ khác (mới nhất) làm default
    if (existing.isDefault) {
      const next = await db.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await db.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    console.error("[deleteAddress]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi xoá địa chỉ" };
  }
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUser();

    const existing = await db.address.findUnique({ where: { id }, select: { userId: true } });
    if (!existing || existing.userId !== userId) {
      return { ok: false, error: "Không tìm thấy địa chỉ" };
    }

    await db.$transaction([
      db.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      }),
      db.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (error) {
    console.error("[setDefaultAddress]", error);
    return { ok: false, error: error instanceof Error ? error.message : "Lỗi" };
  }
}

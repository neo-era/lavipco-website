"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { removeVietnameseAccents } from "@/lib/utils";
import {
  productImportConfig,
  productImportSchema,
  type ProductImportInput,
} from "@/lib/excel/configs/product";
import { runImport } from "@/lib/excel/runner";
import type { ImportResult } from "@/lib/excel/types";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

function productSlugExists(slug: string): Promise<boolean> {
  return db.product
    .findUnique({ where: { slug }, select: { id: true } })
    .then(Boolean);
}

/** Map slug danh mục → id (load 1 lần / import). */
async function loadCategoryMap(): Promise<Map<string, string>> {
  const cats = await db.category.findMany({ select: { slug: true, id: true } });
  return new Map(cats.map((c) => [c.slug, c.id]));
}

function makeValidateExtra(catMap: Map<string, string>) {
  return async (data: ProductImportInput): Promise<string[] | null> =>
    catMap.has(data.categorySlug)
      ? null
      : [`Danh mục không tồn tại (slug: ${data.categorySlug})`];
}

export async function previewImportProduct(base64: string): Promise<ImportResult> {
  await requireAdmin();
  const catMap = await loadCategoryMap();
  return runImport<ProductImportInput>({
    base64,
    config: productImportConfig,
    schema: productImportSchema,
    dryRun: true,
    slugExists: productSlugExists,
    validateExtra: makeValidateExtra(catMap),
  });
}

export async function runImportProduct(base64: string): Promise<ImportResult> {
  await requireAdmin();
  const catMap = await loadCategoryMap();

  const res = await runImport<ProductImportInput>({
    base64,
    config: productImportConfig,
    schema: productImportSchema,
    dryRun: false,
    slugExists: productSlugExists,
    validateExtra: makeValidateExtra(catMap),
    upsert: async (data, slug, exists) => {
      const categoryId = catMap.get(data.categorySlug)!;
      const basePriceNum = data.priceOnRequest ? 0 : data.basePrice ?? 0;
      const stock = data.simpleStock ?? 0;
      const productData = {
        name: data.name,
        nameNoAccent: removeVietnameseAccents(data.name),
        brand: data.brand ?? null,
        categoryId,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        basePrice: new Prisma.Decimal(basePriceNum),
        priceOnRequest: data.priceOnRequest,
        images: data.images,
        catalogueUrl: data.catalogueUrl ?? null,
        specs:
          data.specs.length > 0
            ? (data.specs as Prisma.JsonArray)
            : Prisma.JsonNull,
        status: data.status,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      };

      if (!exists) {
        // Tạo mới + 1 biến thể default (sku auto từ slug)
        const autoSku =
          slug.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 80) || "DEFAULT";
        const skuConflict = await db.productVariant.findFirst({
          where: { sku: autoSku },
          select: { id: true },
        });
        if (skuConflict) {
          throw new Error(`SKU tự sinh "${autoSku}" đã tồn tại — đổi slug khác`);
        }
        await db.product.create({
          data: {
            slug,
            ...productData,
            variants: {
              create: [
                {
                  sku: autoSku,
                  price: new Prisma.Decimal(basePriceNum),
                  stock,
                  isDefault: true,
                },
              ],
            },
          },
        });
      } else {
        // Cập nhật product + biến thể default (price/stock)
        await db.$transaction(async (tx) => {
          const existing = await tx.product.findUnique({
            where: { slug },
            select: {
              id: true,
              variants: {
                select: { id: true },
                orderBy: { isDefault: "desc" },
                take: 1,
              },
            },
          });
          if (!existing) throw new Error("Không tìm thấy sản phẩm");
          await tx.product.update({ where: { id: existing.id }, data: productData });
          const def = existing.variants[0];
          if (def) {
            await tx.productVariant.update({
              where: { id: def.id },
              data: { price: new Prisma.Decimal(basePriceNum), stock },
            });
          } else {
            const autoSku =
              slug.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 80) ||
              "DEFAULT";
            await tx.productVariant.create({
              data: {
                productId: existing.id,
                sku: autoSku,
                price: new Prisma.Decimal(basePriceNum),
                stock,
                isDefault: true,
              },
            });
          }
        });
      }
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return res;
}

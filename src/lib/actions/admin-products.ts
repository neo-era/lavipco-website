"use server";

/**
 * CRUD sản phẩm cho admin panel.
 *
 * Tất cả action:
 *  - Require session.user.role === "ADMIN" (defense-in-depth — middleware đã chặn /admin/*).
 *  - Validate input bằng Zod (productInputSchema).
 *  - Upload ảnh lên Cloudinary (nếu env có), fallback giữ data URL.
 *  - Re-compute nameNoAccent, simpleStock-vs-variants logic, basePrice fallback.
 *  - revalidatePath các route public + admin liên quan.
 *
 * Server Actions vs API route:
 *  - Image upload thường là multipart formData → ở Next.js Server Actions
 *    nhận được dạng base64 data URL từ client (read FileReader → string).
 */
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage, uploadCatalogue } from "@/lib/cloudinary";
import { removeVietnameseAccents } from "@/lib/utils";
import {
  productInputSchema,
  type ProductInput,
  type ProductVariantInput,
} from "@/lib/validations/admin-product";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>> };

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

/**
 * Process ảnh từ form input:
 *  - URL đã tồn tại (http/https) → giữ nguyên (không re-upload).
 *  - data:image/... base64 → upload lên Cloudinary, fallback giữ data URL.
 */
async function processImages(images: string[]): Promise<string[]> {
  const processed: string[] = [];
  for (const img of images) {
    if (img.startsWith("http://") || img.startsWith("https://")) {
      processed.push(img);
    } else if (img.startsWith("data:")) {
      const url = await uploadImage(img);
      processed.push(url);
    } else {
      // Bỏ qua input không hợp lệ
      console.warn("[admin-products] Bỏ qua ảnh không hợp lệ:", img.slice(0, 50));
    }
  }
  return processed;
}

/**
 * Process catalogue PDF từ form input:
 *  - rỗng / null → null (sản phẩm không có catalogue).
 *  - URL http/https đã tồn tại → giữ nguyên (không re-upload).
 *  - data:...base64 (file admin vừa chọn) → upload Cloudinary folder catalogues,
 *    fallback giữ nguyên data URL nếu env Cloudinary thiếu / upload fail.
 */
async function processCatalogue(
  catalogueUrl: string | null | undefined,
): Promise<string | null> {
  if (!catalogueUrl) return null;
  if (catalogueUrl.startsWith("http://") || catalogueUrl.startsWith("https://")) {
    return catalogueUrl;
  }
  if (catalogueUrl.startsWith("data:")) {
    const url = await uploadCatalogue(catalogueUrl);
    return url ?? catalogueUrl;
  }
  // Input không hợp lệ → bỏ
  console.warn("[admin-products] Bỏ qua catalogue không hợp lệ:", catalogueUrl.slice(0, 50));
  return null;
}

/**
 * Chuẩn hoá danh sách variant theo nghiệp vụ:
 *  - Nếu hasVariants=false → trả về 1 variant default duy nhất (sku auto, price=basePrice, stock=simpleStock).
 *  - Nếu hasVariants=true → đảm bảo có đúng 1 isDefault (lấy variant đầu nếu không có).
 */
function normalizeVariants(args: {
  hasVariants: boolean;
  variants: ProductVariantInput[];
  basePrice: number;
  simpleStock: number;
  slug: string;
}): ProductVariantInput[] {
  const { hasVariants, variants, basePrice, simpleStock, slug } = args;

  if (!hasVariants) {
    // Tạo 1 variant default tự động — SKU auto từ slug
    const autoSku = slug.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 80);
    return [
      {
        sku: autoSku || "DEFAULT",
        name: null,
        price: basePrice,
        stock: simpleStock,
        isDefault: true,
        attributes: undefined,
      },
    ];
  }

  // hasVariants=true: ensure exactly 1 default
  const hasDefault = variants.some((v) => v.isDefault);
  if (!hasDefault && variants.length > 0) {
    return variants.map((v, idx) => ({ ...v, isDefault: idx === 0 }));
  }
  // Nếu nhiều default → giữ default đầu, tắt phần còn lại
  let seen = false;
  return variants.map((v) => {
    if (v.isDefault && !seen) {
      seen = true;
      return { ...v, isDefault: true };
    }
    return { ...v, isDefault: false };
  });
}

/**
 * Validate input chung cho create/update.
 */
function validateInput(input: ProductInput) {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Partial<
        Record<string, string[]>
      >,
    };
  }
  return { ok: true as const, data: parsed.data };
}

// ======================================================
// CREATE
// ======================================================

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unauthorized" };
  }

  const validation = validateInput(input);
  if (!validation.ok) {
    return validation;
  }
  const data = validation.data;

  try {
    // Check slug unique
    const exists = await db.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (exists) {
      return {
        ok: false,
        error: "Slug đã tồn tại",
        fieldErrors: { slug: ["Slug đã được sử dụng cho sản phẩm khác"] },
      };
    }

    // Check category exists
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return {
        ok: false,
        error: "Danh mục không tồn tại",
        fieldErrors: { categoryId: ["Danh mục không tồn tại"] },
      };
    }

    // Process ảnh (upload Cloudinary nếu cần)
    const images = await processImages(data.images);
    // Process catalogue PDF (upload Cloudinary nếu là file mới)
    const catalogueUrl = await processCatalogue(data.catalogueUrl);

    // Chuẩn hoá variants
    const basePrice = data.priceOnRequest ? 0 : (data.basePrice ?? 0);
    const variants = normalizeVariants({
      hasVariants: data.hasVariants,
      variants: data.variants,
      basePrice,
      simpleStock: data.simpleStock ?? 0,
      slug: data.slug,
    });

    // Check SKU unique global
    const skus = variants.map((v) => v.sku);
    const skuConflicts = await db.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    if (skuConflicts.length > 0) {
      return {
        ok: false,
        error: `SKU đã tồn tại: ${skuConflicts.map((s) => s.sku).join(", ")}`,
        fieldErrors: {
          variants: [`Các SKU sau đã tồn tại: ${skuConflicts.map((s) => s.sku).join(", ")}`],
        },
      };
    }

    const product = await db.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        nameNoAccent: removeVietnameseAccents(data.name),
        brand: data.brand ?? null,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        basePrice: new Prisma.Decimal(basePrice),
        priceOnRequest: data.priceOnRequest,
        images,
        catalogueUrl,
        specs: data.specs.length > 0 ? (data.specs as Prisma.JsonArray) : Prisma.JsonNull,
        status: data.status,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            name: v.name ?? null,
            price: new Prisma.Decimal(v.price),
            stock: v.stock,
            isDefault: v.isDefault ?? false,
            attributes: v.attributes
              ? (v.attributes as Prisma.JsonObject)
              : Prisma.JsonNull,
          })),
        },
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return { ok: true, data: product };
  } catch (error) {
    console.error("[createProduct]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi tạo sản phẩm",
    };
  }
}

// ======================================================
// UPDATE
// ======================================================

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unauthorized" };
  }

  const validation = validateInput(input);
  if (!validation.ok) return validation;
  const data = validation.data;

  try {
    const existing = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        variants: { select: { id: true, sku: true } },
      },
    });
    if (!existing) {
      return { ok: false, error: "Không tìm thấy sản phẩm" };
    }

    // Check slug unique (trừ chính nó)
    if (data.slug !== existing.slug) {
      const slugConflict = await db.product.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (slugConflict) {
        return {
          ok: false,
          error: "Slug đã tồn tại",
          fieldErrors: { slug: ["Slug đã được sử dụng cho sản phẩm khác"] },
        };
      }
    }

    // Check category exists
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return {
        ok: false,
        error: "Danh mục không tồn tại",
        fieldErrors: { categoryId: ["Danh mục không tồn tại"] },
      };
    }

    // Process ảnh
    const images = await processImages(data.images);
    // Process catalogue PDF (upload Cloudinary nếu là file mới)
    const catalogueUrl = await processCatalogue(data.catalogueUrl);

    const basePrice = data.priceOnRequest ? 0 : (data.basePrice ?? 0);
    const variants = normalizeVariants({
      hasVariants: data.hasVariants,
      variants: data.variants,
      basePrice,
      simpleStock: data.simpleStock ?? 0,
      slug: data.slug,
    });

    // Phân loại variants: giữ (có id, match existing), thêm mới (không id), xoá (id existing không có trong input)
    const existingVariantIds = new Set(existing.variants.map((v) => v.id));
    const keptIds = new Set(
      variants
        .map((v) => v.id)
        .filter((vid): vid is string => Boolean(vid && existingVariantIds.has(vid))),
    );
    const toDeleteIds = existing.variants
      .filter((v) => !keptIds.has(v.id))
      .map((v) => v.id);

    // Check variant ngoài đơn hàng trước khi xoá
    if (toDeleteIds.length > 0) {
      const usedInOrders = await db.orderItem.findFirst({
        where: { productVariantId: { in: toDeleteIds } },
        select: { id: true, productVariantId: true },
      });
      if (usedInOrders) {
        return {
          ok: false,
          error:
            "Không thể xoá biến thể đã có trong đơn hàng. Vui lòng giữ lại biến thể đó hoặc đặt trạng thái sản phẩm ARCHIVED thay vì xoá.",
        };
      }
    }

    // Check SKU unique global (trừ chính variants đang giữ)
    const skus = variants.map((v) => v.sku);
    const skuConflicts = await db.productVariant.findMany({
      where: {
        sku: { in: skus },
        productId: { not: id },
      },
      select: { sku: true },
    });
    if (skuConflicts.length > 0) {
      return {
        ok: false,
        error: `SKU đã tồn tại ở sản phẩm khác: ${skuConflicts.map((s) => s.sku).join(", ")}`,
        fieldErrors: {
          variants: [`SKU trùng: ${skuConflicts.map((s) => s.sku).join(", ")}`],
        },
      };
    }

    // Transaction: update product + variants
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          slug: data.slug,
          name: data.name,
          nameNoAccent: removeVietnameseAccents(data.name),
          brand: data.brand ?? null,
          categoryId: data.categoryId,
          shortDescription: data.shortDescription ?? null,
          description: data.description ?? null,
          basePrice: new Prisma.Decimal(basePrice),
          priceOnRequest: data.priceOnRequest,
          images,
          catalogueUrl,
          specs:
            data.specs.length > 0
              ? (data.specs as Prisma.JsonArray)
              : Prisma.JsonNull,
          status: data.status,
          isFeatured: data.isFeatured,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
        },
      });

      // Xoá variants không còn dùng
      if (toDeleteIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // Update + Create variants
      for (const v of variants) {
        if (v.id && existingVariantIds.has(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              name: v.name ?? null,
              price: new Prisma.Decimal(v.price),
              stock: v.stock,
              isDefault: v.isDefault ?? false,
              attributes: v.attributes
                ? (v.attributes as Prisma.JsonObject)
                : Prisma.JsonNull,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              name: v.name ?? null,
              price: new Prisma.Decimal(v.price),
              stock: v.stock,
              isDefault: v.isDefault ?? false,
              attributes: v.attributes
                ? (v.attributes as Prisma.JsonObject)
                : Prisma.JsonNull,
            },
          });
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath(`/products/${data.slug}`);
    if (data.slug !== existing.slug) {
      revalidatePath(`/products/${existing.slug}`);
    }
    return { ok: true, data: { id, slug: data.slug } };
  } catch (error) {
    console.error("[updateProduct]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật sản phẩm",
    };
  }
}

// ======================================================
// DELETE
// ======================================================

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unauthorized" };
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        variants: { select: { id: true } },
      },
    });
    if (!product) {
      return { ok: false, error: "Không tìm thấy sản phẩm" };
    }

    // Kiểm tra variant có đang trong đơn hàng không
    const variantIds = product.variants.map((v) => v.id);
    if (variantIds.length > 0) {
      const usedInOrders = await db.orderItem.findFirst({
        where: { productVariantId: { in: variantIds } },
        select: { id: true },
      });
      if (usedInOrders) {
        return {
          ok: false,
          error:
            "Không thể xoá sản phẩm đã có trong đơn hàng. Hãy đổi trạng thái sang ARCHIVED để ẩn khỏi danh mục.",
        };
      }
    }

    // Variants + WishlistItems cascade theo schema (onDelete: Cascade)
    await db.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi xoá sản phẩm",
    };
  }
}

// ======================================================
// QUICK ACTIONS từ list page
// ======================================================

/**
 * Đổi trạng thái nhanh (DRAFT / ACTIVE / ARCHIVED) từ list page.
 */
export async function updateProductStatus(
  id: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED",
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unauthorized" };
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!product) return { ok: false, error: "Không tìm thấy sản phẩm" };

    await db.product.update({ where: { id }, data: { status } });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateProductStatus]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật trạng thái",
    };
  }
}

/**
 * Toggle isFeatured nhanh từ list page.
 */
export async function toggleProductFeatured(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unauthorized" };
  }

  try {
    const product = await db.product.findUnique({
      where: { id },
      select: { isFeatured: true, slug: true },
    });
    if (!product) return { ok: false, error: "Không tìm thấy sản phẩm" };

    await db.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    return { ok: true };
  } catch (error) {
    console.error("[toggleProductFeatured]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Lỗi cập nhật",
    };
  }
}

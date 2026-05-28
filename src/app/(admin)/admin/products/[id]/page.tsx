import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { db } from "@/lib/db";
import type { ProductInput } from "@/lib/validations/admin-product";
import { isAIEnabled } from "@/lib/actions/ai-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminProductForm } from "@/components/admin/product-form/AdminProductForm";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, aiEnabled] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    isAIEnabled(),
  ]);

  if (!product) {
    notFound();
  }

  // Detect hasVariants: nếu có >1 variant HOẶC variant duy nhất có attributes
  const hasVariants =
    product.variants.length > 1 ||
    (product.variants.length === 1 &&
      product.variants[0].attributes !== null &&
      product.variants[0].attributes !== undefined);

  // simpleStock: variant default (hoặc đầu) khi hasVariants=false
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const simpleStock = hasVariants ? 0 : (defaultVariant?.stock ?? 0);

  // Parse specs từ Json
  const specsJson = product.specs as unknown;
  const specs: Array<{ key: string; value: string; unit?: string }> = Array.isArray(
    specsJson,
  )
    ? specsJson.map((s) => ({
        key: String((s as { key?: unknown }).key ?? ""),
        value: String((s as { value?: unknown }).value ?? ""),
        unit:
          (s as { unit?: unknown }).unit !== undefined
            ? String((s as { unit?: unknown }).unit)
            : undefined,
      }))
    : [];

  const defaultValues: ProductInput = {
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? "",
    categoryId: product.categoryId,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    priceOnRequest: product.priceOnRequest,
    basePrice: product.priceOnRequest ? undefined : Number(product.basePrice),
    simpleStock,
    images: product.images,
    specs,
    hasVariants,
    variants: hasVariants
      ? product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          price: Number(v.price),
          stock: v.stock,
          isDefault: v.isDefault,
          attributes: v.attributes as Record<string, string> | undefined,
        }))
      : [],
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    status: product.status,
    isFeatured: product.isFeatured,
    catalogueUrl: product.catalogueUrl ?? "",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <Badge
            variant={
              product.status === "ACTIVE"
                ? "default"
                : product.status === "DRAFT"
                  ? "secondary"
                  : "outline"
            }
            className="rounded-full"
          >
            {product.status}
          </Badge>
          {product.isFeatured && (
            <Badge variant="accent" className="rounded-full">
              Nổi bật
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Tạo lúc {product.createdAt.toLocaleDateString("vi-VN")} · Cập nhật{" "}
            {product.updatedAt.toLocaleDateString("vi-VN")}
          </span>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-brand-primary hover:underline"
          >
            Xem trang public
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <AdminProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        defaultValues={defaultValues}
        aiEnabled={aiEnabled}
      />
    </div>
  );
}

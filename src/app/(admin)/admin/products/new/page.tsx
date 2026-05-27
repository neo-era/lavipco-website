import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { db } from "@/lib/db";
import type { ProductInput } from "@/lib/validations/admin-product";
import { Button } from "@/components/ui/button";
import { AdminProductForm } from "@/components/admin/product-form/AdminProductForm";

export const metadata: Metadata = { title: "Thêm sản phẩm" };

export const dynamic = "force-dynamic";

const DEFAULT_VALUES: ProductInput = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  priceOnRequest: false,
  basePrice: undefined,
  simpleStock: 0,
  images: [],
  specs: [],
  hasVariants: false,
  variants: [],
  metaTitle: "",
  metaDescription: "",
  status: "DRAFT",
  isFeatured: false,
  catalogueUrl: "",
};

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

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
        <h1 className="text-2xl font-bold md:text-3xl">Thêm sản phẩm mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Điền 7 mục dưới đây. Có thể lưu nháp bất kỳ lúc nào và tiếp tục sau.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-6 text-sm">
          <p className="font-medium">Chưa có danh mục nào.</p>
          <p className="mt-1 text-muted-foreground">
            Vui lòng tạo ít nhất 1 danh mục ở trang{" "}
            <Link href="/admin/categories" className="text-brand-primary hover:underline">
              Quản lý danh mục
            </Link>{" "}
            trước khi thêm sản phẩm.
          </p>
        </div>
      ) : (
        <AdminProductForm
          mode="create"
          categories={categories}
          defaultValues={DEFAULT_VALUES}
        />
      )}
    </div>
  );
}

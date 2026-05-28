import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { db } from "@/lib/db";
import type { CategoryInput } from "@/lib/validations/admin-category";
import { Button } from "@/components/ui/button";
import { AdminCategoryForm } from "@/components/admin/AdminCategoryForm";

export const metadata: Metadata = { title: "Sửa danh mục" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, parentOptions] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { id: { not: id } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!category) notFound();

  const defaultValues: CategoryInput = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
      </div>
      <AdminCategoryForm
        mode="edit"
        categoryId={category.id}
        defaultValues={defaultValues}
        parentOptions={parentOptions}
      />
    </div>
  );
}

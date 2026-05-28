import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { db } from "@/lib/db";
import type { CategoryInput } from "@/lib/validations/admin-category";
import { Button } from "@/components/ui/button";
import { AdminCategoryForm } from "@/components/admin/AdminCategoryForm";

export const metadata: Metadata = { title: "Thêm danh mục" };

const DEFAULT_VALUES: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  image: "",
  parentId: null,
  sortOrder: 0,
  isActive: true,
};

export default async function NewCategoryPage() {
  const parentOptions = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/categories">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm danh mục mới</h1>
      </div>
      <AdminCategoryForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        parentOptions={parentOptions}
      />
    </div>
  );
}

"use client";

import { deleteCategory } from "@/lib/actions/admin-categories";
import { DeleteRowAction } from "@/components/admin/shared/DeleteRowAction";

export function DeleteCategoryAction({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <DeleteRowAction
      label={name}
      editHref={`/admin/categories/${id}`}
      entityName="danh mục"
      onDelete={() => deleteCategory(id)}
    />
  );
}

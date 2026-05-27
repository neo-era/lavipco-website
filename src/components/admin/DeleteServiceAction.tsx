"use client";

import { deleteService } from "@/lib/actions/admin-services";
import { DeleteRowAction } from "@/components/admin/shared/DeleteRowAction";

export function DeleteServiceAction({
  id,
  title,
  slug,
}: {
  id: string;
  title: string;
  slug: string;
}) {
  return (
    <DeleteRowAction
      label={title}
      editHref={`/admin/services/${id}`}
      publicHref={`/services/${slug}`}
      entityName="dịch vụ"
      onDelete={() => deleteService(id)}
    />
  );
}

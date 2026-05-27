"use client";

import { deleteProject } from "@/lib/actions/admin-projects";
import { DeleteRowAction } from "@/components/admin/shared/DeleteRowAction";

export function DeleteProjectAction({
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
      editHref={`/admin/projects/${id}`}
      publicHref={`/projects/${slug}`}
      entityName="dự án"
      onDelete={() => deleteProject(id)}
    />
  );
}

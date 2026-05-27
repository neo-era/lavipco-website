import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { db } from "@/lib/db";
import type { ProjectInput } from "@/lib/validations/admin-project";
import { Button } from "@/components/ui/button";
import { AdminProjectForm } from "@/components/admin/AdminProjectForm";

export const metadata: Metadata = { title: "Sửa dự án" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  const defaultValues: ProjectInput = {
    title: project.title,
    slug: project.slug,
    summary: project.summary ?? "",
    description: project.description ?? "",
    client: project.client ?? "",
    location: project.location ?? "",
    year: project.year ?? null,
    scale: project.scale ?? "",
    category: project.category,
    images: project.images,
    videoUrl: project.videoUrl ?? "",
    isFeatured: project.isFeatured,
    sortOrder: project.sortOrder,
  };

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/projects">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">{project.title}</h1>
        <Link
          href={`/projects/${project.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          Xem trang public <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <AdminProjectForm
        mode="edit"
        projectId={project.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}

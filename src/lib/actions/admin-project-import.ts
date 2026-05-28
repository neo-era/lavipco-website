"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  projectInputSchema,
  type ProjectInput,
} from "@/lib/validations/admin-project";
import { projectImportConfig } from "@/lib/excel/configs/project";
import { runImport } from "@/lib/excel/runner";
import type { ImportResult } from "@/lib/excel/types";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

function projectSlugExists(slug: string): Promise<boolean> {
  return db.project
    .findUnique({ where: { slug }, select: { id: true } })
    .then(Boolean);
}

export async function previewImportProject(base64: string): Promise<ImportResult> {
  await requireAdmin();
  return runImport<ProjectInput>({
    base64,
    config: projectImportConfig,
    schema: projectInputSchema,
    dryRun: true,
    slugExists: projectSlugExists,
  });
}

export async function runImportProject(base64: string): Promise<ImportResult> {
  await requireAdmin();
  const res = await runImport<ProjectInput>({
    base64,
    config: projectImportConfig,
    schema: projectInputSchema,
    dryRun: false,
    slugExists: projectSlugExists,
    upsert: async (data, slug) => {
      const common = {
        title: data.title,
        summary: data.summary ?? null,
        description: data.description ?? null,
        client: data.client ?? null,
        location: data.location ?? null,
        year: data.year ?? null,
        scale: data.scale ?? null,
        category: data.category,
        images: data.images,
        videoUrl: data.videoUrl ?? null,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      };
      await db.project.upsert({
        where: { slug },
        create: { slug, ...common },
        update: common,
      });
    },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return res;
}

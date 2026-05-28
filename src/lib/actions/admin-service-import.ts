"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceInputSchema,
  type ServiceInput,
} from "@/lib/validations/admin-service";
import { serviceImportConfig } from "@/lib/excel/configs/service";
import { runImport } from "@/lib/excel/runner";
import type { ImportResult } from "@/lib/excel/types";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Yêu cầu quyền quản trị");
  }
}

function serviceSlugExists(slug: string): Promise<boolean> {
  return db.service
    .findUnique({ where: { slug }, select: { id: true } })
    .then(Boolean);
}

export async function previewImportService(base64: string): Promise<ImportResult> {
  await requireAdmin();
  return runImport<ServiceInput>({
    base64,
    config: serviceImportConfig,
    schema: serviceInputSchema,
    dryRun: true,
    slugExists: serviceSlugExists,
  });
}

export async function runImportService(base64: string): Promise<ImportResult> {
  await requireAdmin();
  const res = await runImport<ServiceInput>({
    base64,
    config: serviceImportConfig,
    schema: serviceInputSchema,
    dryRun: false,
    slugExists: serviceSlugExists,
    upsert: async (data, slug) => {
      const processSteps =
        data.processSteps.length > 0
          ? (data.processSteps as Prisma.JsonArray)
          : Prisma.JsonNull;
      const price =
        data.price !== undefined && data.price !== null
          ? new Prisma.Decimal(data.price)
          : null;
      const common = {
        title: data.title,
        shortDescription: data.shortDescription ?? null,
        description: data.description,
        icon: data.icon ?? null,
        coverImage: data.coverImage ?? null,
        price,
        processSteps,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      };
      await db.service.upsert({
        where: { slug },
        create: { slug, ...common },
        update: common,
      });
    },
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return res;
}

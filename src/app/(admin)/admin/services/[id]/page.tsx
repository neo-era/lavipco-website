import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { db } from "@/lib/db";
import type { ServiceInput } from "@/lib/validations/admin-service";
import { isAIEnabled } from "@/lib/actions/ai-content";
import { Button } from "@/components/ui/button";
import { AdminServiceForm } from "@/components/admin/AdminServiceForm";

export const metadata: Metadata = { title: "Sửa dịch vụ" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, aiEnabled] = await Promise.all([
    db.service.findUnique({ where: { id } }),
    isAIEnabled(),
  ]);
  if (!service) notFound();

  const stepsJson = service.processSteps as unknown;
  const processSteps: Array<{ title: string; description?: string | null }> =
    Array.isArray(stepsJson)
      ? stepsJson.map((s) => ({
          title: String((s as { title?: unknown }).title ?? ""),
          description:
            (s as { description?: unknown }).description !== undefined &&
            (s as { description?: unknown }).description !== null
              ? String((s as { description?: unknown }).description)
              : null,
        }))
      : [];

  const defaultValues: ServiceInput = {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription ?? "",
    description: service.description,
    icon: service.icon ?? "",
    coverImage: service.coverImage ?? "",
    price: service.price !== null ? Number(service.price) : null,
    processSteps,
    sortOrder: service.sortOrder,
    isActive: service.isActive,
  };

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/services">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">{service.title}</h1>
        <Link
          href={`/services/${service.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          Xem trang public <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <AdminServiceForm
        mode="edit"
        serviceId={service.id}
        defaultValues={defaultValues}
        aiEnabled={aiEnabled}
      />
    </div>
  );
}

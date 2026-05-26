import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { getServiceIcon } from "@/lib/icons";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Card link sang dịch vụ tương ứng với loại dự án.
 * Ẩn nếu không có serviceSlug map hoặc service không tồn tại.
 */
export async function RelatedService({
  serviceSlug,
}: {
  serviceSlug: string | null;
}) {
  if (!serviceSlug) return null;

  const service = await db.service.findUnique({
    where: { slug: serviceSlug },
    select: { slug: true, title: true, description: true, icon: true, isActive: true },
  });

  if (!service || !service.isActive) return null;

  const Icon = getServiceIcon(service.icon);

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <Container className="max-w-4xl">
        <div className="mb-6 text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Dịch vụ liên quan
          </Badge>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Icon className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
            <Button asChild variant="brand" className="w-full sm:w-auto">
              <Link href={`/services/${service.slug}`}>
                Xem dịch vụ <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

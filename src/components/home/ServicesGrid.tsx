import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { getServiceIcon } from "@/lib/icons";
import { getContent } from "@/lib/content";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Section "Dịch vụ của chúng tôi" — Server Component.
 * Fetch tối đa 6 dịch vụ đang active, sort theo sortOrder.
 */
export async function ServicesGrid() {
  const [services, header] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    getContent("home_services_header"),
  ]);

  if (services.length === 0) return null;

  return (
    <section id="services" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {header.badge && (
            <Badge variant="brand" className="mb-3 rounded-full">
              {header.badge}
            </Badge>
          )}
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {header.heading}
          </h2>
          {header.subHeading && (
            <p className="mt-3 text-muted-foreground">{header.subHeading}</p>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = getServiceIcon(service.icon);
            return (
              <Card
                key={service.id}
                className="group h-full transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/services#${service.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
                  >
                    Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

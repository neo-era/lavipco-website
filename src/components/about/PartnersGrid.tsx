import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

export async function PartnersGrid() {
  const c = await getContent("about_partners");

  return (
    <section id="partners" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {c.badge && (
            <Badge variant="outline" className="mb-3 rounded-full">
              {c.badge}
            </Badge>
          )}
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {c.heading}
          </h2>
          {c.paragraph && (
            <p className="mt-3 text-muted-foreground">{c.paragraph}</p>
          )}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {c.partners.map((partner, i) => (
            <div
              key={i}
              className="relative flex aspect-[5/2] items-center justify-center rounded-lg border bg-background px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-brand-primary/30 hover:text-foreground"
            >
              {partner.logo ? (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-3"
                />
              ) : (
                partner.name
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

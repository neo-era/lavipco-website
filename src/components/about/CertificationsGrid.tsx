import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

export async function CertificationsGrid() {
  const c = await getContent("about_certs");

  return (
    <section id="certifications" className="py-16 md:py-24">
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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.certs.map((cert, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-primary/10 text-brand-primary">
                {cert.logo ? (
                  <Image
                    src={cert.logo}
                    alt={cert.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <BadgeCheck className="h-7 w-7" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{cert.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{cert.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

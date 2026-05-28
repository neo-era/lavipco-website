import Image from "next/image";
import { Lightbulb } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

export async function CompanyStory() {
  const c = await getContent("about_story");

  return (
    <section id="story" className="py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <div className="space-y-5">
          {c.badge && (
            <Badge variant="brand" className="rounded-full">
              {c.badge}
            </Badge>
          )}
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {c.heading}
          </h2>
          <p className="text-muted-foreground md:text-lg">{c.paragraph1}</p>
          <p className="text-muted-foreground">{c.paragraph2}</p>
        </div>

        {/* Image (ảnh thật hoặc gradient + icon fallback) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-primary/15 via-brand-accent/10 to-brand-primary/15">
          {c.image ? (
            <Image
              src={c.image}
              alt={c.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-primary/30">
              <Lightbulb className="h-32 w-32" />
            </div>
          )}
          {(c.overlayBadge || c.overlayCaption) && (
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur">
              {c.overlayBadge && (
                <p className="text-sm font-medium">{c.overlayBadge}</p>
              )}
              {c.overlayCaption && (
                <p className="text-xs text-muted-foreground">{c.overlayCaption}</p>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { getContent } from "@/lib/content";

export async function AboutSummary() {
  const c = await getContent("home_about");

  return (
    <section className="py-16 md:py-24" id="about-summary">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: text */}
        <div className="space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
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
          {c.ctaLabel && (
            <Button asChild size="lg" variant="brand">
              <Link href={c.ctaHref || "#"}>
                {c.ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Right: stats grid */}
        <div className="grid grid-cols-2 gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-700">
          {c.stats.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 p-6 transition-shadow hover:shadow-md"
            >
              <div className="text-3xl font-bold text-brand-primary md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

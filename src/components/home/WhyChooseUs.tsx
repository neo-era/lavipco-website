import {
  ShieldCheck,
  Wrench,
  Building2,
  Headphones,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

// Icon cố định trong code, map theo index (admin không sửa icon).
const ICONS: LucideIcon[] = [ShieldCheck, Wrench, Building2, Headphones];

export async function WhyChooseUs() {
  const c = await getContent("home_why");

  return (
    <section id="why-us" className="py-16 md:py-24">
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
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {c.reasons.map((r, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className="flex gap-4 rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

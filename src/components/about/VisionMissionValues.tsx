import { Eye, Target, Gem, type LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContent } from "@/lib/content";

// Icon cố định theo index (admin không sửa icon).
const ICONS: LucideIcon[] = [Eye, Target, Gem];

export async function VisionMissionValues() {
  const c = await getContent("about_vmv");

  return (
    <section id="vision-mission" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {c.badge && (
            <Badge variant="brand" className="mb-3 rounded-full">
              {c.badge}
            </Badge>
          )}
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {c.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {c.pillars.map((p, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Card key={i} className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {p.label}
                  </p>
                  <CardTitle className="text-xl leading-snug">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

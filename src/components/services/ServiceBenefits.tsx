import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { Benefit } from "@/lib/services-data";

export function ServiceBenefits({ benefits }: { benefits: Benefit[] }) {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Lợi ích
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Điểm mạnh của giải pháp
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold leading-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

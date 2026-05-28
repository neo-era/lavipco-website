import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

export async function CompanyTimeline() {
  const c = await getContent("about_timeline");

  return (
    <section id="timeline" className="py-16 md:py-24">
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

        <ol className="relative mx-auto mt-12 max-w-3xl space-y-10 border-l-2 border-brand-primary/20 pl-6 md:pl-10">
          {c.milestones.map((m, i) => (
            <li key={i} className="relative">
              {/* Dot */}
              <span
                className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-primary bg-background md:-left-[43px] md:h-6 md:w-6"
                aria-hidden
              >
                <span className="h-2 w-2 rounded-full bg-brand-primary md:h-2.5 md:w-2.5" />
              </span>
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  {m.year}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

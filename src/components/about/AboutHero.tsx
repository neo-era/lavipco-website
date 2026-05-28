import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

export async function AboutHero() {
  const c = await getContent("about_hero");

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative py-16 md:py-24">
        <Breadcrumb
          items={[{ title: "Giới thiệu" }]}
          className="mb-6 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-3xl space-y-4">
          {c.badge && (
            <Badge variant="accent" className="rounded-full px-3 py-1">
              {c.badge}
            </Badge>
          )}
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {c.heading}
          </h1>
          <p className="text-lg text-white/85">{c.paragraph}</p>
        </div>
      </Container>
    </section>
  );
}

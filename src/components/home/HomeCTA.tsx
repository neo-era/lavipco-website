import Link from "next/link";
import { ArrowRight, MessageCircle, FileText, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getContent } from "@/lib/content";

export async function HomeCTA() {
  const c = await getContent("home_cta");

  return (
    <section
      id="home-cta"
      className="relative overflow-hidden bg-brand-dark py-16 text-white md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(11,95,165,0.4),_transparent_60%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative grid items-center gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {c.heading}
          </h2>
          <p className="text-white/85 md:text-lg">{c.paragraph}</p>
          <ul className="grid gap-2 text-sm text-white/85 sm:grid-cols-2">
            {c.items.map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          {c.button1Label && (
            <Button asChild size="xl" variant="accent" className="w-full sm:w-auto">
              <Link href={c.button1Href || "#"}>
                <MessageCircle className="h-4 w-4" />
                {c.button1Label}
              </Link>
            </Button>
          )}
          {c.button2Label && (
            <Button
              asChild
              size="xl"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Link href={c.button2Href || "#"}>
                <FileText className="h-4 w-4" />
                {c.button2Label} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}

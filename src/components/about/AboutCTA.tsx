import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/content";
import { getSiteContact } from "@/lib/site-settings";

export async function AboutCTA() {
  const [c, contact] = await Promise.all([
    getContent("about_cta"),
    getSiteContact(),
  ]);

  return (
    <section
      id="about-cta"
      className="relative overflow-hidden bg-brand-primary py-16 text-white md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.25),_transparent_55%)]" />
      <Container className="relative grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            {c.heading}
          </h2>
          <p className="text-white/85 md:text-lg">{c.paragraph}</p>
          {(contact.hotline || contact.email) && (
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-white/85">
              {contact.hotline && (
                <a
                  href={`tel:${contact.hotline.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-brand-accent"
                >
                  <Phone className="h-4 w-4" />
                  {contact.hotline}
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 hover:text-brand-accent"
                >
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          {c.button1Label && (
            <Button asChild size="xl" variant="accent" className="w-full sm:w-auto">
              <Link href={c.button1Href || "#"}>
                {c.button1Label} <ArrowRight className="h-4 w-4" />
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
              <Link href={c.button2Href || "#"}>{c.button2Label}</Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}

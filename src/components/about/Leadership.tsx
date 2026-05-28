import Image from "next/image";
import { UserCircle } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { getContent } from "@/lib/content";

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}

export async function Leadership() {
  const c = await getContent("about_leadership");

  return (
    <section id="leadership" className="bg-muted/30 py-16 md:py-24">
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.leaders.map((leader, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-accent/15 text-brand-primary/60">
                {leader.photo ? (
                  <Image
                    src={leader.photo}
                    alt={leader.name || leader.role}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className="h-20 w-20" />
                    <span className="text-3xl font-bold">
                      {getInitials(leader.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1 p-5">
                {leader.name && (
                  <h3 className="font-semibold leading-tight">{leader.name}</h3>
                )}
                <p className="text-sm font-medium text-brand-primary">
                  {leader.role}
                </p>
                <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
                  {leader.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { getServiceIcon } from "@/lib/icons";

export function ServiceDetailHero({
  title,
  description,
  icon,
  coverImage,
}: {
  title: string;
  description: string;
  icon: string | null;
  coverImage: string | null;
}) {
  const Icon = getServiceIcon(icon);

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      {/* Optional cover image overlay */}
      {coverImage && (
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-25"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiMxZTNhOGEiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
          priority
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />

      <Container className="relative grid gap-10 py-16 md:grid-cols-3 md:py-20">
        <div className="space-y-5 md:col-span-2">
          <Breadcrumb
            items={[
              { title: "Dịch vụ", href: "/services" },
              { title },
            ]}
            className="text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
          />
          <Badge variant="accent" className="rounded-full px-3 py-1">
            Dịch vụ kỹ thuật
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-white/85">{description}</p>
        </div>

        {/* Icon visual */}
        <div className="hidden items-center justify-center md:flex">
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur">
            <Icon className="h-24 w-24 text-brand-accent" />
          </div>
        </div>
      </Container>
    </section>
  );
}

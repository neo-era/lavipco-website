"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import type { HeroSlide } from "@/lib/content/schema";

// Gradient fallback khi slide chưa có ảnh nền (cycle theo index cho đa dạng).
const FALLBACK_GRADIENTS = [
  "from-brand-primary via-brand-primary to-brand-dark",
  "from-brand-dark via-brand-primary to-brand-primary",
  "from-brand-primary via-brand-dark to-brand-dark",
];

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const autoplay = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [autoplay.current]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden border-b text-white"
      aria-roledescription="carousel"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="relative flex min-w-0 flex-[0_0_100%] items-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} trên ${slides.length}`}
            >
              {/* Nền: ảnh thật (phủ tối để chữ đọc được) hoặc gradient fallback */}
              {slide.image ? (
                <>
                  <Image
                    src={slide.image}
                    alt={slide.heading}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
                </>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length],
                  )}
                />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />

              <Container className="relative py-20 md:py-28">
                <div className="max-w-2xl space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
                  {slide.badge && (
                    <Badge variant="accent" className="rounded-full px-3 py-1">
                      {slide.badge}
                    </Badge>
                  )}
                  <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    {slide.heading}
                  </h1>
                  <p className="max-w-xl text-lg text-white/85">{slide.subHeading}</p>
                  {slide.ctaLabel && (
                    <Button asChild size="lg" variant="accent">
                      <Link href={slide.ctaHref || "#"}>
                        {slide.ctaLabel} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </Container>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator (ẩn nếu chỉ 1 slide) */}
      {scrollSnaps.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === selectedIndex
                  ? "w-8 bg-brand-accent"
                  : "w-2 bg-white/40 hover:bg-white/70",
              )}
              aria-label={`Đi tới slide ${idx + 1}`}
              aria-current={idx === selectedIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

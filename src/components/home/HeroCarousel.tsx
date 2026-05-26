"use client";

import * as React from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Lightbulb, TrafficCone, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";

type Slide = {
  badge: string;
  heading: string;
  subHeading: string;
  ctaLabel: string;
  ctaHref: string;
  Icon: React.ComponentType<{ className?: string }>;
  // Gradient placeholder vì chưa có ảnh thật.
  // TODO: thay bằng <Image src={s.image} fill placeholder="blur"/> khi có file
  gradient: string;
};

const slides: Slide[] = [
  {
    badge: "Smart City",
    heading: "Chiếu sáng đô thị thông minh",
    subHeading:
      "Giải pháp điều khiển từ cấp tủ tới điểm sáng, tích hợp camera, IoT và nền tảng điều hành đô thị.",
    ctaLabel: "Khám phá giải pháp",
    ctaHref: "/services#smart-lighting",
    Icon: Lightbulb,
    gradient: "from-brand-primary via-brand-primary to-brand-dark",
  },
  {
    badge: "ITS · QCVN 41:2019",
    heading: "Đèn tín hiệu giao thông",
    subHeading:
      "Thiết kế, cung cấp và lắp đặt cho nút giao đô thị — tuân thủ QCVN và tiêu chuẩn ITS Việt Nam.",
    ctaLabel: "Xem sản phẩm",
    ctaHref: "/services#traffic-light",
    Icon: TrafficCone,
    gradient: "from-brand-dark via-brand-primary to-brand-primary",
  },
  {
    badge: "Hạ tầng điện",
    heading: "Đối tác kỹ thuật tin cậy",
    subHeading:
      "Đường dây trung/hạ thế, trạm biến áp, tủ điều khiển — phục vụ chủ đầu tư, ban quản lý đô thị và nhà thầu trên toàn quốc.",
    ctaLabel: "Yêu cầu báo giá",
    ctaHref: "/contact",
    Icon: Building2,
    gradient: "from-brand-primary via-brand-dark to-brand-dark",
  },
];

export function HeroCarousel() {
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
              className={cn(
                "relative flex min-w-0 flex-[0_0_100%] items-center bg-gradient-to-br",
                slide.gradient,
              )}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} trên ${slides.length}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
              <Container className="relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
                <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
                  <Badge variant="accent" className="rounded-full px-3 py-1">
                    {slide.badge}
                  </Badge>
                  <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    {slide.heading}
                  </h1>
                  <p className="max-w-xl text-lg text-white/85">{slide.subHeading}</p>
                  <Button asChild size="lg" variant="accent">
                    <Link href={slide.ctaHref}>
                      {slide.ctaLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden items-center justify-center md:flex">
                  <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur">
                    <slide.Icon className="h-32 w-32 text-brand-accent" />
                  </div>
                </div>
              </Container>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
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
    </section>
  );
}

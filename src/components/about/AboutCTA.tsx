import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

export function AboutCTA() {
  return (
    <section
      id="about-cta"
      className="relative overflow-hidden bg-brand-primary py-16 text-white md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.25),_transparent_55%)]" />
      <Container className="relative grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Liên hệ với chúng tôi
          </h2>
          <p className="text-white/85 md:text-lg">
            Đội ngũ LAVIPCO sẵn sàng tư vấn giải pháp kỹ thuật phù hợp với dự án
            của bạn. Liên hệ ngay để được hỗ trợ nhanh chóng.
          </p>
          {(SITE_CONFIG.hotline || SITE_CONFIG.email) && (
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-white/85">
              {SITE_CONFIG.hotline && (
                <a
                  href={`tel:${SITE_CONFIG.hotline.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-brand-accent"
                >
                  <Phone className="h-4 w-4" />
                  {SITE_CONFIG.hotline}
                </a>
              )}
              {SITE_CONFIG.email && (
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-2 hover:text-brand-accent"
                >
                  <Mail className="h-4 w-4" />
                  {SITE_CONFIG.email}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Button asChild size="xl" variant="accent" className="w-full sm:w-auto">
            <Link href="/contact">
              Liên hệ ngay <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Link href="/projects">Xem dự án đã thực hiện</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

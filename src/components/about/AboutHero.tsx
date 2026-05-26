import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative py-16 md:py-24">
        <Breadcrumb
          items={[{ title: "Giới thiệu" }]}
          className="mb-6 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent" className="rounded-full px-3 py-1">
            Về {SITE_CONFIG.name}
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Đối tác kỹ thuật cho đô thị thông minh Việt Nam
          </h1>
          <p className="text-lg text-white/85">
            {SITE_CONFIG.fullName} — đơn vị chuyên cung cấp giải pháp đèn tín hiệu
            giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và Smart City.
          </p>
        </div>
      </Container>
    </section>
  );
}

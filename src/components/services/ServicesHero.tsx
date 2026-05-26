import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";

export function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative py-16 md:py-20">
        <Breadcrumb
          items={[{ title: "Dịch vụ" }]}
          className="mb-6 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent" className="rounded-full px-3 py-1">
            Dịch vụ
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
            Giải pháp kỹ thuật trọn gói
          </h1>
          <p className="text-lg text-white/85">
            Từ thiết kế, cung cấp thiết bị đến triển khai và vận hành — LAVIPCO
            đồng hành cùng chủ đầu tư, ban quản lý đô thị và nhà thầu.
          </p>
        </div>
      </Container>
    </section>
  );
}

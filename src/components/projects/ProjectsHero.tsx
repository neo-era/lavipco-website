import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";

export function ProjectsHero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative py-16 md:py-20">
        <Breadcrumb
          items={[{ title: "Dự án" }]}
          className="mb-6 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent" className="rounded-full px-3 py-1">
            Portfolio
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
            Dự án đã thực hiện
          </h1>
          <p className="text-lg text-white/85">
            Tuyển chọn các công trình LAVIPCO đã triển khai trên cả nước — từ đèn
            tín hiệu giao thông, chiếu sáng đô thị thông minh đến hạ tầng điện và
            Smart City.
          </p>
        </div>
      </Container>
    </section>
  );
}

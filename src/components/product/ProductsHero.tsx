import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";

export function ProductsHero({ totalProducts }: { totalProducts: number }) {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative py-14 md:py-20">
        <Breadcrumb
          items={[{ title: "Sản phẩm" }]}
          className="mb-5 text-white/80 [&_a:hover]:text-white [&_[aria-current]]:text-white"
        />
        <div className="max-w-3xl space-y-3">
          <Badge variant="accent" className="rounded-full px-3 py-1">
            Catalog
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
            Sản phẩm LAVIPCO
          </h1>
          <p className="text-base text-white/85 md:text-lg">
            {totalProducts} thiết bị chiếu sáng và điều khiển cho hạ tầng đô thị —
            có sẵn báo giá hoặc yêu cầu báo giá theo dự án.
          </p>
        </div>
      </Container>
    </section>
  );
}

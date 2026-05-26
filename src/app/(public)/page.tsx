import Link from "next/link";
import {
  ArrowRight,
  TrafficCone,
  Lightbulb,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Building2,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    slug: "den-tin-hieu-giao-thong",
    title: "Đèn tín hiệu giao thông",
    description:
      "Thiết kế, cung cấp và lắp đặt đèn tín hiệu giao thông tại các nút giao đô thị, đáp ứng QCVN và tiêu chuẩn ITS.",
    Icon: TrafficCone,
  },
  {
    slug: "chieu-sang-do-thi-thong-minh",
    title: "Chiếu sáng đô thị thông minh",
    description:
      "Hệ thống LED đường phố điều khiển cấp tủ, mở rộng đến từng điểm sáng, tích hợp Smart City.",
    Icon: Lightbulb,
  },
  {
    slug: "chieu-sang-canh-quan",
    title: "Chiếu sáng cảnh quan",
    description:
      "Chiếu sáng kiến trúc, công viên, quảng trường — tạo điểm nhấn và bản sắc cho không gian đô thị.",
    Icon: Sparkles,
  },
  {
    slug: "ha-tang-dien",
    title: "Hạ tầng điện",
    description:
      "Đường dây trung/hạ thế, trạm biến áp, tủ điều khiển và hệ thống điện hạ tầng đô thị.",
    Icon: Zap,
  },
];

const featuredProjects = [
  {
    slug: "chieu-sang-do-thi-thong-minh-phuong-ninh-thanh",
    title: "Chiếu sáng đô thị thông minh - Phường Ninh Thạnh",
    summary:
      "Hệ thống điều khiển chiếu sáng cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera & Smart City.",
    location: "Tây Ninh",
    year: 2026,
    category: "Chiếu sáng đô thị",
  },
];

const stats = [
  { label: "Năm kinh nghiệm", value: "10+" },
  { label: "Dự án đã thực hiện", value: "50+" },
  { label: "Đối tác chiến lược", value: "20+" },
  { label: "Tỉnh thành phục vụ", value: "15+" },
];

const advantages = [
  {
    Icon: ShieldCheck,
    title: "Tuân thủ tiêu chuẩn",
    desc: "Thiết kế đáp ứng QCVN, TCVN và quy chuẩn ITS cho hạ tầng đô thị.",
  },
  {
    Icon: Wrench,
    title: "Đội kỹ thuật giàu kinh nghiệm",
    desc: "Kỹ sư điện, tự động hóa và viễn thông triển khai từ thiết kế tới vận hành.",
  },
  {
    Icon: Building2,
    title: "Sẵn sàng cho Smart City",
    desc: "Kiến trúc mở, tích hợp camera, IoT, đèn tín hiệu và nền tảng điều hành đô thị.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.15),_transparent_50%)]" />
        <Container className="relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="space-y-6">
            <Badge variant="accent" className="rounded-full px-3 py-1">
              Kỹ Nghệ Lâm Việt Phát · LAVIPCO
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Giải pháp{" "}
              <span className="text-brand-accent">đèn tín hiệu giao thông</span>{" "}
              & chiếu sáng đô thị thông minh
            </h1>
            <p className="max-w-xl text-lg text-white/85">
              Chúng tôi cung cấp giải pháp trọn gói từ thiết kế, cung cấp thiết bị
              đến triển khai và vận hành — phục vụ chủ đầu tư, ban quản lý đô thị
              và nhà thầu trên toàn quốc.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/services">
                  Khám phá dịch vụ <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Yêu cầu báo giá</Link>
              </Button>
            </div>
          </div>

          {/* Khối tóm tắt */}
          <div className="hidden items-center justify-center md:flex">
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="text-3xl font-bold text-brand-accent">
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="brand" className="mb-3 rounded-full">
              Dịch vụ
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Năng lực kỹ thuật toàn diện
            </h2>
            <p className="mt-3 text-muted-foreground">
              LAVIPCO cung cấp đầy đủ giải pháp từ phần cứng tới phần mềm điều khiển
              cho hạ tầng đô thị.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ slug, title, description, Icon }) => (
              <Card
                key={slug}
                className="group h-full transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/services#${slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
                  >
                    Tìm hiểu thêm <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* WHY US */}
      <section className="bg-muted/30 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 rounded-full">
              Vì sao chọn LAVIPCO
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Đối tác kỹ thuật tin cậy cho đô thị thông minh
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {advantages.map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Badge variant="brand" className="mb-3 rounded-full">
                Dự án nổi bật
              </Badge>
              <h2 className="text-balance text-3xl font-bold md:text-4xl">
                Những công trình LAVIPCO đã triển khai
              </h2>
            </div>
            <Button asChild variant="link" className="text-brand-primary">
              <Link href="/projects">
                Xem tất cả dự án <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((p) => (
              <Card key={p.slug} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[16/10] bg-gradient-to-br from-brand-primary/15 to-brand-accent/15">
                  {/* TODO: thay bằng next/image khi có ảnh dự án */}
                  <div className="flex h-full items-center justify-center text-brand-primary/40">
                    <Lightbulb className="h-16 w-16" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.category}</span>
                    <span>·</span>
                    <span>{p.location}</span>
                    <span>·</span>
                    <span>{p.year}</span>
                  </div>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {p.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
                  >
                    Chi tiết dự án <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark py-16 text-white md:py-20">
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-balance text-3xl font-bold md:text-4xl">
                Cần tư vấn cho dự án sắp tới?
              </h2>
              <p className="mt-3 text-white/80">
                Để lại thông tin, đội ngũ kỹ thuật LAVIPCO sẽ liên hệ tư vấn và gửi
                báo giá phù hợp trong vòng 24 giờ.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-white/85 sm:grid-cols-2">
                {[
                  "Khảo sát hiện trạng miễn phí",
                  "Thiết kế kỹ thuật chi tiết",
                  "Báo giá minh bạch, có VAT",
                  "Bảo hành dài hạn, hỗ trợ vận hành",
                ].map((it) => (
                  <li key={it} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild size="xl" variant="accent">
                <Link href="/contact">
                  Yêu cầu báo giá <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-white/60 md:text-right">
                Hoặc gọi hotline để được hỗ trợ ngay
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

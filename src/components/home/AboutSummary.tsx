import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { SITE_CONFIG } from "@/lib/constants";

const stats = [
  { value: "10+", label: "Năm kinh nghiệm" },
  { value: "50+", label: "Dự án đã thực hiện" },
  { value: "100+", label: "Khách hàng tin cậy" },
  { value: "30+", label: "Kỹ sư & nhân sự" },
];

export function AboutSummary() {
  return (
    <section className="py-16 md:py-24" id="about-summary">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: text */}
        <div className="space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
          <Badge variant="brand" className="rounded-full">
            Về {SITE_CONFIG.name}
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Đối tác kỹ thuật trong lĩnh vực chiếu sáng & hạ tầng đô thị
          </h2>
          <p className="text-muted-foreground md:text-lg">
            {SITE_CONFIG.fullName} là đơn vị chuyên cung cấp thiết bị và giải pháp
            đèn tín hiệu giao thông, chiếu sáng đô thị thông minh, hạ tầng điện và
            Smart City. Chúng tôi đồng hành cùng chủ đầu tư, ban quản lý đô thị và
            nhà thầu từ khâu thiết kế, cung cấp đến triển khai và vận hành.
          </p>
          <p className="text-muted-foreground">
            Đội ngũ kỹ sư điện, tự động hóa và viễn thông của LAVIPCO sẵn sàng tư
            vấn giải pháp phù hợp với từng quy mô dự án — từ một nút giao đơn lẻ
            đến cả tuyến phố và khu đô thị thông minh.
          </p>
          <Button asChild size="lg" variant="brand">
            <Link href="/about">
              Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Right: stats grid */}
        <div className="grid grid-cols-2 gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-700">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-gradient-to-br from-brand-primary/5 to-brand-accent/10 p-6 transition-shadow hover:shadow-md"
            >
              <div className="text-3xl font-bold text-brand-primary md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

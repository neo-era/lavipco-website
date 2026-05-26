import { ShieldCheck, Wrench, Building2, Headphones } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

const reasons = [
  {
    Icon: ShieldCheck,
    title: "Tuân thủ tiêu chuẩn",
    description:
      "Thiết kế và thi công đáp ứng QCVN, TCVN và tiêu chuẩn ITS cho hạ tầng đô thị Việt Nam.",
  },
  {
    Icon: Wrench,
    title: "Đội kỹ thuật giàu kinh nghiệm",
    description:
      "Kỹ sư điện, tự động hoá và viễn thông triển khai trọn gói từ thiết kế tới vận hành.",
  },
  {
    Icon: Building2,
    title: "Sẵn sàng cho Smart City",
    description:
      "Kiến trúc mở, tích hợp camera, IoT, đèn tín hiệu và nền tảng điều hành đô thị.",
  },
  {
    Icon: Headphones,
    title: "Hỗ trợ dài hạn",
    description:
      "Bảo hành dài hạn, dịch vụ vận hành & bảo trì 24/7 cho các dự án trọng điểm.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Vì sao chọn chúng tôi
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Đối tác kỹ thuật tin cậy cho đô thị thông minh
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {reasons.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

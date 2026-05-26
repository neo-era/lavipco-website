import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

// TODO: Lam cập nhật năm + nội dung cột mốc thật của LAVIPCO
const MILESTONES = [
  {
    year: "2014",
    title: "Thành lập công ty",
    description:
      "Nhóm kỹ sư điện và viễn thông sáng lập LAVIPCO, định hướng vào chiếu sáng đô thị và hạ tầng điện.",
  },
  {
    year: "2017",
    title: "Mở rộng năng lực ITS",
    description:
      "Triển khai các dự án đèn tín hiệu giao thông đầu tiên, đạt chứng nhận QCVN 41 và tiêu chuẩn TCVN.",
  },
  {
    year: "2020",
    title: "Bước vào chiếu sáng thông minh",
    description:
      "Hoàn thành các dự án LED đường phố quy mô lớn, ứng dụng điều khiển cấp tủ và đo điện năng từ xa.",
  },
  {
    year: "2023",
    title: "Ra mắt nền tảng điều khiển",
    description:
      "Phát triển hệ điều khiển trung tâm LAVIPCO Cloud — giám sát, lập lịch và phân tích điện năng theo từng điểm sáng.",
  },
  {
    year: "2026",
    title: "Triển khai Smart City Ninh Thạnh",
    description:
      "Dự án độc lập điều khiển chiếu sáng cấp tủ, lộ trình mở rộng đến điểm sáng, tích hợp camera và thiết bị IoT.",
  },
];

export function CompanyTimeline() {
  return (
    <section id="timeline" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Lịch sử phát triển
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Những cột mốc đáng nhớ
          </h2>
        </div>

        <ol className="relative mx-auto mt-12 max-w-3xl space-y-10 border-l-2 border-brand-primary/20 pl-6 md:pl-10">
          {MILESTONES.map((m) => (
            <li key={m.year} className="relative">
              {/* Dot */}
              <span
                className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-primary bg-background md:-left-[43px] md:h-6 md:w-6"
                aria-hidden
              >
                <span className="h-2 w-2 rounded-full bg-brand-primary md:h-2.5 md:w-2.5" />
              </span>
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  {m.year}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

import { Eye, Target, Gem } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: Lam có thể chỉnh nội dung 3 trụ cột này theo định hướng thật của LAVIPCO
const PILLARS = [
  {
    Icon: Eye,
    label: "Tầm nhìn",
    title: "Trở thành đối tác tin cậy hàng đầu Việt Nam",
    description:
      "trong lĩnh vực chiếu sáng đô thị thông minh và hệ thống tín hiệu giao thông — đồng hành cùng các thành phố trên hành trình chuyển đổi sang Smart City.",
  },
  {
    Icon: Target,
    label: "Sứ mệnh",
    title: "Mang lại giải pháp kỹ thuật chất lượng cao",
    description:
      "an toàn, bền vững và phù hợp với điều kiện thực tế Việt Nam — từ thiết kế, cung cấp thiết bị đến triển khai và vận hành.",
  },
  {
    Icon: Gem,
    label: "Giá trị cốt lõi",
    title: "Tận tâm · Kỹ thuật · Bền vững",
    description:
      "Đặt khách hàng và sự an toàn của cộng đồng lên hàng đầu; coi chất lượng kỹ thuật là nền tảng; phát triển có trách nhiệm với môi trường và xã hội.",
  },
] as const;

export function VisionMissionValues() {
  return (
    <section id="vision-mission" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Tầm nhìn · Sứ mệnh · Giá trị
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Ba trụ cột định hướng LAVIPCO
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ Icon, label, title, description }) => (
            <Card key={label} className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <CardTitle className="text-xl leading-snug">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

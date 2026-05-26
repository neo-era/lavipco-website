import { Lightbulb } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants";

export function CompanyStory() {
  return (
    <section id="story" className="py-16 md:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <div className="space-y-5">
          <Badge variant="brand" className="rounded-full">
            Câu chuyện
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Hành trình xây dựng năng lực kỹ thuật
          </h2>
          {/* TODO: Lam thay nội dung câu chuyện thật của công ty */}
          <p className="text-muted-foreground md:text-lg">
            {SITE_CONFIG.fullName} được thành lập bởi nhóm kỹ sư điện, tự động hoá
            và viễn thông với mong muốn đưa các giải pháp chiếu sáng và điều khiển
            hiện đại tới các đô thị Việt Nam. Từ những dự án nhỏ ở địa phương,
            LAVIPCO dần khẳng định năng lực trong lĩnh vực hạ tầng điện và đèn tín
            hiệu giao thông.
          </p>
          <p className="text-muted-foreground">
            Đến nay, công ty đã đồng hành cùng nhiều chủ đầu tư, ban quản lý đô
            thị và nhà thầu trên cả nước — từ thiết kế kỹ thuật, cung cấp thiết
            bị, đến triển khai, vận hành và bảo trì. Định hướng của LAVIPCO là
            tiếp tục mở rộng sang các giải pháp Smart City: điều khiển từng điểm
            sáng, tích hợp camera giao thông, IoT và nền tảng điều hành tập trung.
          </p>
        </div>

        {/* Image placeholder */}
        {/* TODO: thay bằng <Image src="/about/story.jpg" alt=".." fill placeholder="blur"/> */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-primary/15 via-brand-accent/10 to-brand-primary/15">
          <div className="absolute inset-0 flex items-center justify-center text-brand-primary/30">
            <Lightbulb className="h-32 w-32" />
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-medium">Hơn 10 năm kinh nghiệm</p>
            <p className="text-xs text-muted-foreground">
              Kỹ thuật bền vững · An toàn · Tuân thủ tiêu chuẩn
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

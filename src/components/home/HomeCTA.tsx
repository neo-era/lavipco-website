import Link from "next/link";
import { ArrowRight, MessageCircle, FileText, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

const checkpoints = [
  "Khảo sát hiện trạng miễn phí",
  "Thiết kế kỹ thuật chi tiết",
  "Báo giá minh bạch, có VAT",
  "Bảo hành dài hạn, hỗ trợ vận hành",
];

export function HomeCTA() {
  return (
    <section
      id="home-cta"
      className="relative overflow-hidden bg-brand-dark py-16 text-white md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(11,95,165,0.4),_transparent_60%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_55%)]" />
      <Container className="relative grid items-center gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Cần tư vấn cho dự án của bạn?
          </h2>
          <p className="text-white/85 md:text-lg">
            Để lại thông tin, đội ngũ kỹ thuật LAVIPCO sẽ liên hệ tư vấn và gửi báo
            giá phù hợp trong vòng 24 giờ.
          </p>
          <ul className="grid gap-2 text-sm text-white/85 sm:grid-cols-2">
            {checkpoints.map((it) => (
              <li key={it} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Button asChild size="xl" variant="accent" className="w-full sm:w-auto">
            <Link href="/contact">
              <MessageCircle className="h-4 w-4" />
              Liên hệ ngay
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Link href="/contact?type=quotation">
              <FileText className="h-4 w-4" />
              Yêu cầu báo giá <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

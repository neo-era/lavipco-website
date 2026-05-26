import { Award, ShieldCheck, BadgeCheck, FileBadge } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

// TODO: Lam thay icon bằng ảnh logo chứng chỉ thật khi có file PNG/SVG
type Certification = {
  name: string;
  issuer: string;
  Icon: LucideIcon;
};

const CERTIFICATIONS: Certification[] = [
  { name: "ISO 9001:2015", issuer: "Quản lý chất lượng", Icon: ShieldCheck },
  { name: "ISO 14001:2015", issuer: "Quản lý môi trường", Icon: Award },
  { name: "QCVN 41:2019/BGTVT", issuer: "Báo hiệu đường bộ", Icon: BadgeCheck },
  { name: "TCVN 7722-2-3:2013", issuer: "Đèn LED chiếu sáng đường phố", Icon: FileBadge },
  { name: "ISO 45001:2018", issuer: "An toàn & sức khoẻ nghề nghiệp", Icon: ShieldCheck },
  { name: "Chứng nhận hợp chuẩn LED", issuer: "Bộ KH&CN", Icon: BadgeCheck },
];

export function CertificationsGrid() {
  return (
    <section id="certifications" className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Năng lực
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Chứng nhận và tiêu chuẩn áp dụng
          </h2>
          <p className="mt-3 text-muted-foreground">
            LAVIPCO triển khai dự án tuân thủ các tiêu chuẩn kỹ thuật và quản lý chất
            lượng hàng đầu.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATIONS.map(({ name, issuer, Icon }) => (
            <div
              key={name}
              className="flex items-center gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{issuer}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

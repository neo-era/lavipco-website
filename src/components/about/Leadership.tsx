import { UserCircle } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

// TODO: Lam điền danh sách lãnh đạo thật, kèm ảnh /public/team/<name>.jpg
type Leader = {
  name: string;
  role: string;
  bio: string;
  image?: string;
};

const LEADERS: Leader[] = [
  {
    name: "[TODO: Họ tên CEO]",
    role: "Tổng Giám đốc",
    bio: "Hơn 15 năm kinh nghiệm điều hành các dự án hạ tầng điện và chiếu sáng đô thị tại Việt Nam.",
  },
  {
    name: "[TODO: Họ tên Giám đốc kỹ thuật]",
    role: "Giám đốc Kỹ thuật",
    bio: "Kỹ sư tự động hoá, chuyên gia về điều khiển chiếu sáng và hệ thống ITS.",
  },
  {
    name: "[TODO: Họ tên Trưởng phòng Dự án]",
    role: "Trưởng phòng Dự án",
    bio: "Quản lý triển khai các dự án Smart City và đèn tín hiệu giao thông đô thị.",
  },
  {
    name: "[TODO: Họ tên Trưởng phòng Kinh doanh]",
    role: "Trưởng phòng Kinh doanh",
    bio: "Phụ trách phát triển khách hàng và đối tác chiến lược trong lĩnh vực hạ tầng đô thị.",
  },
];

export function Leadership() {
  return (
    <section id="leadership" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Đội ngũ lãnh đạo
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Những người định hình LAVIPCO
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERS.map((leader) => {
            const initials = leader.name
              .replace(/\[TODO:.*?\]/, "?")
              .split(/\s+/)
              .filter(Boolean)
              .slice(-2)
              .map((s) => s[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={leader.role}
                className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                {/* Avatar placeholder */}
                {/* TODO: thay bằng <Image src={leader.image} fill placeholder="blur"/> */}
                <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-accent/15 text-brand-primary/60">
                  {leader.image ? null : (
                    <div className="flex flex-col items-center gap-2">
                      <UserCircle className="h-20 w-20" />
                      <span className="text-3xl font-bold">{initials || "?"}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-5">
                  <h3 className="font-semibold leading-tight">{leader.name}</h3>
                  <p className="text-sm font-medium text-brand-primary">{leader.role}</p>
                  <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
                    {leader.bio}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

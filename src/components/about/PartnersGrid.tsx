import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

// TODO: Lam thay text bằng <Image src="/partners/<slug>.png"/> khi có logo
const PARTNERS = [
  "Sở GTVT TP.HCM",
  "UBND Phường Ninh Thạnh",
  "Công ty Chiếu sáng ĐT",
  "Tổng công ty Điện lực",
  "Ban QLDA Đô thị",
  "Tập đoàn xây dựng X",
  "Khu công nghiệp Y",
  "Đối tác chiến lược Z",
];

export function PartnersGrid() {
  return (
    <section id="partners" className="bg-muted/30 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Đối tác
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Đối tác và khách hàng tiêu biểu
          </h2>
          <p className="mt-3 text-muted-foreground">
            Niềm tin của khách hàng là động lực để chúng tôi không ngừng nâng cao
            chất lượng dịch vụ.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <div
              key={partner}
              className="flex aspect-[5/2] items-center justify-center rounded-lg border bg-background px-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-brand-primary/30 hover:text-foreground"
            >
              {partner}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

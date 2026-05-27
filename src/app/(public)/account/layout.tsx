import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { AccountSidebar } from "@/components/account/AccountSidebar";

/**
 * Layout cho /account/* — sidebar trái + content phải.
 * Middleware đã chặn user chưa login (xem src/middleware.ts).
 */
export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <section className="border-b bg-muted/20 print:hidden">
        <Container className="py-4">
          <Breadcrumb items={[{ title: "Tài khoản" }]} />
        </Container>
      </section>

      <section className="py-8 md:py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="print:hidden">
              <AccountSidebar />
            </div>
            <div className="min-w-0">{children}</div>
          </div>
        </Container>
      </section>
    </>
  );
}

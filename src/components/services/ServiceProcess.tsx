import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { ProcessStep } from "@/lib/services-data";

export function ServiceProcess({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Quy trình
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Cách chúng tôi triển khai
          </h2>
          <p className="mt-3 text-muted-foreground">
            Quy trình {steps.length} bước minh bạch, có cam kết tiến độ và chất lượng.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ title, description, Icon }, idx) => (
            <li key={title} className="relative">
              {/* Connector line on desktop - vẽ giữa các step */}
              {idx < steps.length - 1 && (
                <span
                  className="absolute left-1/2 top-6 hidden h-px w-full bg-border lg:block"
                  aria-hidden
                />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-brand-primary text-sm font-bold text-white shadow-md">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="mt-4 text-brand-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold leading-tight">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

import { Hammer } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

/**
 * Section placeholder cho các trang còn ở giai đoạn skeleton.
 * Khi triển khai nội dung thật, xóa component này và viết page riêng.
 */
export function PlaceholderSection({
  title,
  description,
  phase,
}: {
  title: string;
  description?: string;
  phase?: string;
}) {
  return (
    <section className="flex min-h-[60vh] items-center py-16">
      <Container className="max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent">
          <Hammer className="h-6 w-6" />
        </div>
        <h1 className="text-balance text-3xl font-bold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 text-muted-foreground md:text-lg">{description}</p>
        )}
        {phase && (
          <Badge variant="outline" className="mt-6">
            Đang phát triển · {phase}
          </Badge>
        )}
      </Container>
    </section>
  );
}

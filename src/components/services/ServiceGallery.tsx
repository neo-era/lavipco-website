import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

/**
 * Gallery hình ảnh minh hoạ - tối đa 6 ảnh.
 * Nếu chưa có ảnh thật, hiển thị 3 placeholder gradient.
 * TODO: gắn vào Service.images String[] khi mở rộng schema (hiện chỉ có coverImage).
 */
export function ServiceGallery({ images }: { images: string[] }) {
  const showcase = images.length > 0 ? images.slice(0, 6) : null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Hình ảnh minh hoạ
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Một số hình ảnh thực tế
          </h2>
          {!showcase && (
            <p className="mt-3 text-sm text-muted-foreground">
              Đang cập nhật album hình ảnh dự án. Liên hệ để xem hồ sơ năng lực đầy đủ.
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showcase
            ? showcase.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={src}
                    alt={`Hình ảnh ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
                  />
                </div>
              ))
            : Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary/40"
                >
                  <ImageIcon className="h-12 w-12" />
                </div>
              ))}
        </div>
      </Container>
    </section>
  );
}

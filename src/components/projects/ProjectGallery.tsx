"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Gallery ảnh với lightbox tự code (Dialog + keyboard nav).
 * Phím tắt: ← → để chuyển, Esc đóng (Dialog mặc định).
 */
export function ProjectGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const goTo = React.useCallback(
    (delta: number) => {
      setOpenIndex((i) =>
        i === null ? null : (i + delta + images.length) % images.length,
      );
    },
    [images.length],
  );

  React.useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(-1);
      else if (event.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, goTo]);

  if (images.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3 rounded-full">
            Hình ảnh
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Gallery dự án
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Click vào ảnh để xem lớn. Dùng phím ← → để chuyển.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
              aria-label={`Xem ảnh ${idx + 1} của ${title}`}
            >
              <Image
                src={src}
                alt={`${title} - ảnh ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4="
              />
            </button>
          ))}
        </div>
      </Container>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-w-5xl border-none bg-background/95 p-2 sm:p-3">
          <DialogTitle className="sr-only">
            {title} - ảnh {openIndex !== null ? openIndex + 1 : ""}/{images.length}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Dùng phím ← → để chuyển ảnh, Esc để đóng.
          </DialogDescription>
          {openIndex !== null && (
            <div className="relative">
              <div className="relative mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded">
                <Image
                  src={images[openIndex]}
                  alt={`${title} - ảnh ${openIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
              {/* Counter */}
              <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goTo(-1)}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="tabular-nums">
                  {openIndex + 1} / {images.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goTo(1)}
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

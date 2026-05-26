"use client";

import * as React from "react";
import Image from "next/image";
import { Package, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

/**
 * Gallery sản phẩm:
 *  - Ảnh chính lớn (aspect-square)
 *  - Thumbnails phía dưới
 *  - Hover ảnh chính → zoom (CSS scale + cursor-zoom-in)
 *  - Click ảnh chính → lightbox với prev/next
 *  - Bàn phím trong lightbox: ← → để chuyển (Esc do Dialog mặc định)
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const goTo = React.useCallback(
    (delta: number) => {
      setActiveIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length],
  );

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(-1);
      else if (event.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goTo]);

  // Empty state - không có ảnh
  if (images.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex aspect-square items-center justify-center rounded-lg border bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary/40">
          <Package className="h-24 w-24" />
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      {/* Ảnh chính - hover zoom + click mở lightbox */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-lg border bg-muted"
        aria-label={`Mở ảnh ${name} ở chế độ lớn`}
      >
        <Image
          src={activeImage}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="cursor-zoom-in object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
        />
        <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 bg-muted transition-colors",
                idx === activeIndex
                  ? "border-brand-primary"
                  : "border-transparent hover:border-brand-primary/30",
              )}
              aria-label={`Xem ảnh ${idx + 1}`}
              aria-current={idx === activeIndex ? "true" : undefined}
            >
              <Image
                src={src}
                alt={`${name} - thumb ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-none bg-background/95 p-2 sm:p-3">
          <DialogTitle className="sr-only">
            {name} - ảnh {activeIndex + 1}/{images.length}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Dùng phím ← → để chuyển ảnh, Esc để đóng.
          </DialogDescription>
          <div className="relative">
            <div className="relative mx-auto aspect-video w-full max-h-[80vh] overflow-hidden rounded">
              <Image
                src={activeImage}
                alt={`${name} - ảnh ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(-1)}
                aria-label="Ảnh trước"
                disabled={images.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="tabular-nums">
                {activeIndex + 1} / {images.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(1)}
                aria-label="Ảnh sau"
                disabled={images.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

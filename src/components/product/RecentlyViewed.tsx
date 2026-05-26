"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, History } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "lavipco-recent-products";
const MAX_ITEMS = 8;
const SHOW_ITEMS = 4;

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

type ViewedItem = {
  slug: string;
  name: string;
  image?: string;
  price: number;
  priceOnRequest: boolean;
};

type Props = {
  /** Sản phẩm hiện đang xem - dùng để prepend vào localStorage và exclude khỏi danh sách. */
  current: ViewedItem;
};

/**
 * Track + render "Sản phẩm đã xem" (localStorage).
 * - Trên mount: prepend current vào danh sách, dedupe theo slug, slice MAX_ITEMS.
 * - Render SHOW_ITEMS sản phẩm khác current.
 * - Ẩn section khi không có lịch sử khác.
 */
export function RecentlyViewed({ current }: Props) {
  const [items, setItems] = React.useState<ViewedItem[]>([]);

  React.useEffect(() => {
    let stored: ViewedItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as ViewedItem[];
    } catch {
      stored = [];
    }

    // Prepend current, dedupe theo slug
    const next = [current, ...stored.filter((i) => i.slug !== current.slug)].slice(
      0,
      MAX_ITEMS,
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota error
    }

    // setItems = danh sách trừ current để hiển thị
    setItems(next.filter((i) => i.slug !== current.slug).slice(0, SHOW_ITEMS));
  }, [current]);

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <History className="h-5 w-5" />
          </div>
          <div>
            <Badge variant="outline" className="rounded-full">
              Lịch sử xem
            </Badge>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">Sản phẩm đã xem</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="group flex gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/40">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-brand-primary">
                  {item.name}
                </p>
                <p className="mt-auto text-sm font-bold text-brand-primary">
                  {item.priceOnRequest ? "Liên hệ" : formatCurrency(item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

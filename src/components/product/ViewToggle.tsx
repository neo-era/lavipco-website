"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  buildProductsUrl,
  parseFilters,
  parseSort,
  parseViewMode,
  type ViewMode,
} from "@/lib/products-data";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const view = parseViewMode(searchParams.get("view") ?? undefined);

  function setView(next: ViewMode) {
    if (next === view) return;
    const filters = parseFilters({
      category: searchParams.get("category") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    const sort = parseSort(searchParams.get("sort") ?? undefined);
    startTransition(() =>
      router.push(buildProductsUrl({ filters, sort, view: next }), { scroll: false }),
    );
  }

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border",
        isPending && "opacity-60",
      )}
      role="group"
      aria-label="Chế độ hiển thị"
    >
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        aria-label="Lưới"
        className={cn(
          "flex h-9 w-10 items-center justify-center transition-colors",
          view === "grid"
            ? "bg-brand-primary text-white"
            : "bg-background text-foreground/60 hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        aria-label="Danh sách"
        className={cn(
          "flex h-9 w-10 items-center justify-center border-l transition-colors",
          view === "list"
            ? "bg-brand-primary text-white"
            : "bg-background text-foreground/60 hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

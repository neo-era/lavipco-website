"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  buildProductsUrl,
  parseFilters,
  parseSort,
  parseViewMode,
  PRODUCT_SORT_OPTIONS,
  type ProductSort,
} from "@/lib/products-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductSortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = parseSort(searchParams.get("sort") ?? undefined);

  function handleChange(value: string) {
    const sort = value as ProductSort;
    // Đọc các param khác từ URL hiện tại
    const filters = parseFilters({
      category: searchParams.get("category") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    const view = parseViewMode(searchParams.get("view") ?? undefined);
    startTransition(() =>
      router.push(buildProductsUrl({ filters, sort, view }), { scroll: false }),
    );
  }

  return (
    <Select value={currentSort} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-44 text-sm">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        {PRODUCT_SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

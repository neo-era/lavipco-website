"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  buildProductsUrl,
  parseSort,
  parseViewMode,
  type ProductFilters,
} from "@/lib/products-data";

export type CategoryNode = {
  slug: string;
  name: string;
  children?: CategoryNode[];
};

type Props = {
  categories: CategoryNode[];
  brands: string[];
  /** Trạng thái filter ban đầu, parse từ searchParams ở server. */
  initial: ProductFilters;
};

export function ProductFilters({ categories, brands, initial }: Props) {
  // Mobile: dùng Sheet
  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
              <SheetDescription className="sr-only">
                Lọc theo danh mục, thương hiệu, khoảng giá
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FiltersPanel
                categories={categories}
                brands={brands}
                initial={initial}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6 rounded-xl border bg-card p-5">
          <FiltersPanel categories={categories} brands={brands} initial={initial} />
        </div>
      </aside>
    </>
  );
}

function FiltersPanel({
  categories,
  brands,
  initial,
}: {
  categories: CategoryNode[];
  brands: string[];
  initial: ProductFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // Local state cho UI mượt, sync với URL khi commit
  const [selectedCategory, setSelectedCategory] = React.useState(initial.category);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(initial.brands);
  const [minPrice, setMinPrice] = React.useState(
    initial.minPrice !== null ? String(initial.minPrice) : "",
  );
  const [maxPrice, setMaxPrice] = React.useState(
    initial.maxPrice !== null ? String(initial.maxPrice) : "",
  );

  // Giữ sort + view hiện tại khi navigate filter mới
  const currentSort = parseSort(searchParams.get("sort") ?? undefined);
  const currentView = parseViewMode(searchParams.get("view") ?? undefined);

  function navigate(filters: Partial<ProductFilters>) {
    const url = buildProductsUrl({
      filters: {
        category: selectedCategory,
        brands: selectedBrands,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        q: initial.q,
        ...filters,
      },
      sort: currentSort,
      view: currentView,
      page: 1, // reset về trang 1 khi đổi filter
    });
    startTransition(() => router.push(url, { scroll: false }));
  }

  function handleCategory(slug: string | null) {
    setSelectedCategory(slug);
    navigate({ category: slug });
  }

  function toggleBrand(brand: string, checked: boolean) {
    const next = checked
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
    setSelectedBrands(next);
    navigate({ brands: next });
  }

  function handlePriceApply(event: React.FormEvent) {
    event.preventDefault();
    navigate({
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    });
  }

  function reset() {
    setSelectedCategory(null);
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    startTransition(() =>
      router.push(
        buildProductsUrl({ sort: currentSort, view: currentView }),
        { scroll: false },
      ),
    );
  }

  const hasActive =
    selectedCategory ||
    selectedBrands.length > 0 ||
    minPrice ||
    maxPrice ||
    initial.q;

  return (
    <div className={cn("space-y-6", isPending && "opacity-60")}>
      {/* Reset */}
      {hasActive && (
        <Button variant="ghost" size="sm" onClick={reset} className="text-destructive">
          <X className="h-3.5 w-3.5" />
          Xoá tất cả filter
        </Button>
      )}

      {/* Categories tree */}
      <FilterGroup label="Danh mục">
        <ul className="space-y-1.5 text-sm">
          <li>
            <CategoryButton
              onClick={() => handleCategory(null)}
              active={selectedCategory === null}
            >
              Tất cả danh mục
            </CategoryButton>
          </li>
          {categories.map((cat) => (
            <React.Fragment key={cat.slug}>
              <li>
                <CategoryButton
                  onClick={() => handleCategory(cat.slug)}
                  active={selectedCategory === cat.slug}
                >
                  {cat.name}
                </CategoryButton>
              </li>
              {cat.children?.map((child) => (
                <li key={child.slug} className="pl-4">
                  <CategoryButton
                    onClick={() => handleCategory(child.slug)}
                    active={selectedCategory === child.slug}
                    indent
                  >
                    {child.name}
                  </CategoryButton>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </FilterGroup>

      {/* Brands multi-checkbox */}
      {brands.length > 0 && (
        <FilterGroup label="Thương hiệu">
          <div className="space-y-2.5">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(c) => toggleBrand(brand, c === true)}
                />
                {brand}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Price range — 2 input min/max */}
      <FilterGroup label="Khoảng giá (VND)">
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs">
                Từ
              </Label>
              <Input
                id="minPrice"
                type="number"
                inputMode="numeric"
                min={0}
                step={100000}
                placeholder="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs">
                Đến
              </Label>
              <Input
                id="maxPrice"
                type="number"
                inputMode="numeric"
                min={0}
                step={100000}
                placeholder="∞"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Áp dụng giá
          </Button>
        </form>
      </FilterGroup>

      {/* Specs filter: skip ở phase này.
          TODO: filter công suất / IP rating cần Product.specs JSON path query.
          Sẽ làm khi schema specs được chuẩn hoá. */}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      {children}
    </div>
  );
}

function CategoryButton({
  onClick,
  active,
  indent,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  indent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-brand-primary/10 font-semibold text-brand-primary"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
        indent && "text-[13px]",
      )}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </button>
  );
}

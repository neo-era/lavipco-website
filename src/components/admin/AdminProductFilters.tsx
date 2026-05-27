"use client";

/**
 * Filter bar cho /admin/products:
 *  - Search box (q): match name / nameNoAccent / brand
 *  - Category select
 *  - Status select (ALL / DRAFT / ACTIVE / ARCHIVED)
 *  - Featured select (ALL / YES / NO)
 *
 * Đồng bộ filter qua URL searchParams + replace + scroll: false.
 * Submit search có debounce 300ms.
 */
import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  initial: {
    q: string;
    categoryId: string;
    status: string;
    featured: string;
  };
};

export function AdminProductFilters({ categories, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(initial.q);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // reset page khi đổi filter
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Debounce cho search box
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (q !== initial.q) updateParam("q", q.trim() || null);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function clearFilters() {
    const params = new URLSearchParams();
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setQ("");
  }

  const hasFilters =
    initial.q ||
    initial.categoryId !== "ALL" ||
    initial.status !== "ALL" ||
    initial.featured !== "ALL";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, SKU, thương hiệu..."
          className="pl-9"
        />
      </div>

      {/* Category */}
      <Select
        value={initial.categoryId}
        onValueChange={(v) => updateParam("categoryId", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả danh mục</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={initial.status}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Mọi trạng thái</SelectItem>
          <SelectItem value="ACTIVE">Đang bán</SelectItem>
          <SelectItem value="DRAFT">Nháp</SelectItem>
          <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
        </SelectContent>
      </Select>

      {/* Featured */}
      <Select
        value={initial.featured}
        onValueChange={(v) => updateParam("featured", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Nổi bật" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          <SelectItem value="YES">Nổi bật</SelectItem>
          <SelectItem value="NO">Bình thường</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4" />
          Xoá lọc
        </Button>
      )}
    </div>
  );
}

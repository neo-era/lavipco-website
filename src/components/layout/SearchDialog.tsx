"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, Loader2 } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { searchProducts, type SearchProductResult } from "@/lib/actions/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 8;

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiNlMmU4ZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

/**
 * Search dialog ở Header.
 * - Click trigger → mở CommandDialog
 * - Nhập từ khoá → debounce 300ms → searchProducts() Server Action
 * - Hiển thị tối đa 8 kết quả + link "Xem tất cả" → /products?q=<keyword>
 */
export function SearchDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [results, setResults] = React.useState<SearchProductResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Debounce query 300ms
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch khi debounced thay đổi
  React.useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchProducts(debounced, RESULT_LIMIT)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("[search] Lỗi tìm kiếm", error);
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Khi mở dialog: reset query
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
      setResults([]);
    }
  }, [open]);

  // Trigger via wrapper (parent giữ trigger style)
  function handleTriggerClick(event: React.MouseEvent) {
    event.preventDefault();
    setOpen(true);
  }

  function goToFullResults() {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  return (
    <>
      <span onClick={handleTriggerClick} className="contents">
        {trigger}
      </span>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Tìm sản phẩm: đèn LED, đèn tín hiệu, tủ điều khiển..."
          value={query}
          onValueChange={setQuery}
          // Tắt filter built-in của cmdk - server đã trả kết quả đã filter
        />
        <CommandList>
          {/* Hint khi từ khoá quá ngắn */}
          {debounced.length < MIN_QUERY_LENGTH && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nhập tối thiểu {MIN_QUERY_LENGTH} ký tự để bắt đầu tìm
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tìm...
            </div>
          )}

          {!loading && debounced.length >= MIN_QUERY_LENGTH && results.length === 0 && (
            <CommandEmpty>Không tìm thấy sản phẩm phù hợp với &quot;{debounced}&quot;</CommandEmpty>
          )}

          {!loading && results.length > 0 && (
            <>
              <CommandGroup heading={`Sản phẩm (${results.length})`}>
                {results.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p.name} ${p.brand ?? ""}`}
                    onSelect={() => {
                      router.push(`/products/${p.slug}`);
                      setOpen(false);
                    }}
                    className="!py-2"
                  >
                    <ProductHit product={p} />
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  value="view-all-results"
                  onSelect={goToFullResults}
                  className={cn(
                    "justify-center text-sm font-medium text-brand-primary",
                    "data-[selected=true]:bg-brand-primary/10",
                  )}
                >
                  Xem tất cả kết quả cho &quot;{query.trim()}&quot;
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function ProductHit({ product }: { product: SearchProductResult }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex w-full items-center gap-3"
      onClick={(e) => {
        // CommandItem.onSelect đã xử lý navigation → ngăn double
        e.preventDefault();
      }}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-primary/40">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{product.name}</span>
        {product.brand && (
          <span className="text-[11px] text-muted-foreground">{product.brand}</span>
        )}
      </div>
      <span className="ml-auto shrink-0 text-sm font-semibold text-brand-primary">
        {product.priceOnRequest ? "Liên hệ" : formatCurrency(product.basePrice)}
      </span>
    </Link>
  );
}

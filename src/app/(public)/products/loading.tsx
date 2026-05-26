import { Container } from "@/components/layout/Container";

/**
 * Loading skeleton cho /products (và các URL có searchParams).
 * Next.js tự render khi page đang fetch DB.
 */
export default function ProductsLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="border-b bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white">
        <Container className="py-14 md:py-20">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/20" />
            <div className="h-10 w-64 animate-pulse rounded bg-white/20 md:h-12 md:w-96" />
            <div className="h-5 w-3/4 max-w-2xl animate-pulse rounded bg-white/15" />
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar skeleton - chỉ desktop */}
            <aside className="hidden lg:block">
              <div className="space-y-5 rounded-xl border bg-card p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="space-y-1.5">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-7 w-full animate-pulse rounded bg-muted/60"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div>
              {/* Toolbar skeleton */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-9 w-44 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>

              {/* Grid skeleton */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PRODUCTS_PAGE_SIZE_LOADING }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col overflow-hidden rounded-lg border bg-card"
                  >
                    <div className="aspect-square animate-pulse bg-muted" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-16 animate-pulse rounded bg-muted/60" />
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-5 w-20 animate-pulse rounded bg-muted/60" />
                      <div className="mt-2 h-8 w-full animate-pulse rounded bg-muted/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

const PRODUCTS_PAGE_SIZE_LOADING = 8;

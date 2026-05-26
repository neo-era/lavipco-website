"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { MAIN_NAV, SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/Container";
import { CartIcon } from "@/components/layout/CartIcon";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { BrandLogo } from "@/components/common/BrandLogo";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = React.useCallback(
    (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href)),
    [pathname],
  );

  // Theo dõi scroll để thêm shadow lúc cuộn xuống
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Đóng mobile sheet khi điều hướng
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-background/80",
        scrolled ? "shadow-md" : "shadow-none",
      )}
    >
      {/* Top bar liên hệ - desktop. Ẩn nếu không có hotline & email */}
      {(SITE_CONFIG.hotline || SITE_CONFIG.email) && (
        <div className="hidden border-b bg-brand-dark text-white md:block">
          <Container className="flex h-9 items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {SITE_CONFIG.hotline && (
                <a
                  href={`tel:${SITE_CONFIG.hotline.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 hover:text-brand-accent"
                >
                  <Phone className="h-3 w-3" />
                  Hotline: {SITE_CONFIG.hotline}
                </a>
              )}
              {SITE_CONFIG.email && (
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="hover:text-brand-accent"
                >
                  {SITE_CONFIG.email}
                </a>
              )}
            </div>
            <div className="text-white/70">{SITE_CONFIG.workingHours}</div>
          </Container>
        </div>
      )}

      {/* Main nav */}
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Mobile menu button (trái) + Logo */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Mở menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle>
                  <Link href="/" className="inline-flex items-center" aria-label={SITE_CONFIG.name}>
                    <BrandLogo size="sm" />
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Điều hướng chính
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {MAIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-base font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="mt-3 border-t pt-3">
                  <Button asChild variant="brand" className="w-full">
                    <Link href="/contact">Yêu cầu báo giá</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label={`${SITE_CONFIG.name} - ${SITE_CONFIG.fullName}`}
          >
            <BrandLogo size="md" priority />
            <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              Kỹ Nghệ Lâm Việt Phát
            </span>
          </Link>
        </div>

        {/* Desktop nav - giữa */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand-primary",
                isActive(item.href) ? "text-brand-primary" : "text-foreground/70",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <SearchDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
                <Search className="h-5 w-5" />
              </Button>
            }
          />
          <CartIcon />
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}


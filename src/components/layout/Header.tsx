"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { mainNav, siteConfig } from "@/lib/site-config";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = React.useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  // Đóng menu khi điều hướng
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top bar - liên hệ nhanh */}
      <div className="hidden border-b bg-brand-dark text-white md:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteConfig.contact.hotline.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-brand-accent"
            >
              <Phone className="h-3 w-3" />
              Hotline: {siteConfig.contact.hotline}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="hover:text-brand-accent"
            >
              {siteConfig.contact.email}
            </a>
          </div>
          <div className="text-white/70">{siteConfig.contact.workingHours}</div>
        </Container>
      </div>

      {/* Main navigation */}
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-white font-bold">
            L
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-brand-primary">{siteConfig.name}</span>
            <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              Kỹ Nghệ Lâm Việt Phát
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand-primary",
                isActive(item.href)
                  ? "text-brand-primary"
                  : "text-foreground/70",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label="Giỏ hàng"
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="brand" size="sm" className="hidden md:inline-flex">
            <Link href="/contact">Yêu cầu báo giá</Link>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </Container>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="border-t bg-background lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-base font-medium",
                  isActive(item.href)
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-foreground/80 hover:bg-muted",
                )}
              >
                {item.title}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t pt-3">
              <Button asChild variant="brand" className="flex-1">
                <Link href="/contact">Yêu cầu báo giá</Link>
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Giỏ hàng">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

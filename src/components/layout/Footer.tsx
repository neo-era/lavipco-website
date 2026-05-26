import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { footerNav, siteConfig } from "@/lib/site-config";

// Lucide v1 không còn icon brand. Dùng inline SVG cho Facebook/YouTube.
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.84c0-2.52 1.5-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.58v1.9h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.5 7.55a3 3 0 0 0-2.11-2.12C19.45 5 12 5 12 5s-7.45 0-9.39.43A3 3 0 0 0 .5 7.55 31 31 0 0 0 0 12a31 31 0 0 0 .5 4.45 3 3 0 0 0 2.11 2.12C4.55 19 12 19 12 19s7.45 0 9.39-.43a3 3 0 0 0 2.11-2.12A31 31 0 0 0 24 12a31 31 0 0 0-.5-4.45ZM9.6 15.57V8.43l6.2 3.57Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-brand-dark text-white/80">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary font-bold text-white">
                L
              </div>
              <span className="text-lg font-bold text-white">{siteConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed">{siteConfig.fullName}</p>
            <p className="text-xs text-white/60">{siteConfig.contact.taxCode}</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>{siteConfig.contact.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                <a href={`tel:${siteConfig.contact.hotline.replace(/\s/g, "")}`}>
                  {siteConfig.contact.hotline}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                <a href={`mailto:${siteConfig.contact.email}`}>
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Dịch vụ */}
          <FooterColumn title="Dịch vụ" items={footerNav.services} />

          {/* Công ty */}
          <FooterColumn title="Công ty" items={footerNav.company} />

          {/* Pháp lý */}
          <FooterColumn title="Pháp lý" items={footerNav.legal} />
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
          <div>
            © {year} {siteConfig.fullName}. Mọi quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-3">
            {siteConfig.social.facebook && (
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-brand-accent"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}
            {siteConfig.social.youtube && (
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:text-brand-accent"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: readonly { title: string; href: string }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-white/70 transition-colors hover:text-brand-accent"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

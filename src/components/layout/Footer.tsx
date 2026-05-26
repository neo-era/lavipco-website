import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { FOOTER_NAV, SITE_CONFIG } from "@/lib/constants";

/**
 * Footer - Server Component.
 * 4 cột: Về LAVIPCO | Liên kết nhanh | Hỗ trợ | Liên hệ
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-brand-dark text-white/80">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Về LAVIPCO */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {/* TODO: thay bằng next/image với logo chính thức */}
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary font-bold text-white">
                L
              </div>
              <span className="text-lg font-bold text-white">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm leading-relaxed">{SITE_CONFIG.fullName}</p>
            <p className="text-sm leading-relaxed text-white/60">
              {SITE_CONFIG.tagline}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 pt-2">
              {SITE_CONFIG.social.facebook && (
                <SocialLink
                  href={SITE_CONFIG.social.facebook}
                  label="Facebook"
                  icon={<FacebookIcon className="h-4 w-4" />}
                />
              )}
              {SITE_CONFIG.social.zalo && (
                <SocialLink
                  href={SITE_CONFIG.social.zalo}
                  label="Zalo"
                  icon={<ZaloIcon className="h-4 w-4" />}
                />
              )}
              {SITE_CONFIG.social.youtube && (
                <SocialLink
                  href={SITE_CONFIG.social.youtube}
                  label="YouTube"
                  icon={<YoutubeIcon className="h-4 w-4" />}
                />
              )}
            </div>

            {/* Logo Bộ Công Thương placeholder */}
            {/* TODO: thay bằng <Image src="/bocongthuong.png"/> khi đã đăng ký xong */}
            <a
              href="http://online.gov.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded border border-white/15 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-wider text-white/60 hover:bg-white/10"
              title="Đã đăng ký Bộ Công Thương"
            >
              Đã đăng ký Bộ Công Thương
            </a>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <FooterColumn title="Liên kết nhanh" items={FOOTER_NAV.quickLinks} />

          {/* Cột 3: Hỗ trợ */}
          <FooterColumn title="Hỗ trợ" items={FOOTER_NAV.support} />

          {/* Cột 4: Liên hệ */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Liên hệ
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <span>{SITE_CONFIG.address}</span>
                </li>
              )}
              {SITE_CONFIG.hotline && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                  <a
                    href={`tel:${SITE_CONFIG.hotline.replace(/\s/g, "")}`}
                    className="hover:text-white"
                  >
                    {SITE_CONFIG.hotline}
                  </a>
                </li>
              )}
              {SITE_CONFIG.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="hover:text-white"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </li>
              )}
              {SITE_CONFIG.taxCode && (
                <li className="text-xs text-white/60">MST: {SITE_CONFIG.taxCode}</li>
              )}
              <li className="text-xs text-white/60">{SITE_CONFIG.workingHours}</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
          © {year} {SITE_CONFIG.name}. All rights reserved.
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

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-brand-accent hover:text-brand-accent-foreground"
    >
      {icon}
    </a>
  );
}

// Lucide v1 không có brand icons - dùng inline SVG (license cho phép)
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
function ZaloIcon({ className }: { className?: string }) {
  // Zalo logo simplified inline (placeholder)
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 5.93 2 10.78c0 2.83 1.52 5.34 3.86 6.94L5 21l3.9-1.97c.97.27 2.01.41 3.1.41 5.52 0 10-3.93 10-8.66S17.52 2 12 2Zm-3.7 11.36H6.3c-.25 0-.45-.2-.45-.45v-3.6c0-.25.2-.45.45-.45s.45.2.45.45v3.15h1.55c.25 0 .45.2.45.45s-.2.45-.45.45Zm2.95-.45c0 .25-.2.45-.45.45s-.45-.2-.45-.45v-3.6c0-.25.2-.45.45-.45s.45.2.45.45v3.6Zm5.45.45h-.55l-.4-1h-1.9l-.4 1h-.55l1.6-4.05c.06-.16.21-.25.4-.25s.34.09.4.25l1.4 4.05Zm-2.5-1.85h1.3l-.65-1.7-.65 1.7Z" />
    </svg>
  );
}

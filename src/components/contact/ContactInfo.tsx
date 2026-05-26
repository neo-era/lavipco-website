import { Building2, MapPin, Phone, Mail, Clock, BadgeCheck } from "lucide-react";

import { SITE_CONFIG } from "@/lib/constants";

/**
 * Cột trái trang Liên hệ - thông tin công ty.
 * Field nào rỗng (chưa điền trong SITE_CONFIG) thì ẩn dòng tương ứng.
 */
export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Thông tin liên hệ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Liên hệ trực tiếp qua hotline hoặc email để được hỗ trợ nhanh nhất.
        </p>
      </div>

      <ul className="space-y-4">
        <InfoRow Icon={Building2} label="Công ty">
          {SITE_CONFIG.fullName}
        </InfoRow>

        {SITE_CONFIG.address && (
          <InfoRow Icon={MapPin} label="Địa chỉ">
            {SITE_CONFIG.address}
          </InfoRow>
        )}

        {SITE_CONFIG.hotline && (
          <InfoRow Icon={Phone} label="Hotline">
            <a
              href={`tel:${SITE_CONFIG.hotline.replace(/\s/g, "")}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {SITE_CONFIG.hotline}
            </a>
          </InfoRow>
        )}

        {SITE_CONFIG.email && (
          <InfoRow Icon={Mail} label="Email">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {SITE_CONFIG.email}
            </a>
          </InfoRow>
        )}

        <InfoRow Icon={Clock} label="Giờ làm việc">
          {SITE_CONFIG.workingHours}
        </InfoRow>

        {SITE_CONFIG.taxCode && (
          <InfoRow Icon={BadgeCheck} label="Mã số thuế">
            {SITE_CONFIG.taxCode}
          </InfoRow>
        )}
      </ul>

      {/* Social */}
      {(SITE_CONFIG.social.facebook ||
        SITE_CONFIG.social.zalo ||
        SITE_CONFIG.social.youtube) && (
        <div className="border-t pt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Kết nối với chúng tôi
          </p>
          <div className="flex items-center gap-2">
            {SITE_CONFIG.social.facebook && (
              <SocialBubble
                href={SITE_CONFIG.social.facebook}
                label="Facebook"
                icon={<FacebookIcon className="h-4 w-4" />}
              />
            )}
            {SITE_CONFIG.social.zalo && (
              <SocialBubble
                href={SITE_CONFIG.social.zalo}
                label="Zalo"
                icon={<ZaloIcon className="h-4 w-4" />}
              />
            )}
            {SITE_CONFIG.social.youtube && (
              <SocialBubble
                href={SITE_CONFIG.social.youtube}
                label="YouTube"
                icon={<YoutubeIcon className="h-4 w-4" />}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  Icon,
  label,
  children,
}: {
  Icon: typeof Building2;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-base font-medium leading-snug">{children}</p>
      </div>
    </li>
  );
}

function SocialBubble({
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
      className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground/70 transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
    >
      {icon}
    </a>
  );
}

// Lucide v1 không có brand icons - inline SVG
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
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 5.93 2 10.78c0 2.83 1.52 5.34 3.86 6.94L5 21l3.9-1.97c.97.27 2.01.41 3.1.41 5.52 0 10-3.93 10-8.66S17.52 2 12 2Zm-3.7 11.36H6.3c-.25 0-.45-.2-.45-.45v-3.6c0-.25.2-.45.45-.45s.45.2.45.45v3.15h1.55c.25 0 .45.2.45.45s-.2.45-.45.45Zm2.95-.45c0 .25-.2.45-.45.45s-.45-.2-.45-.45v-3.6c0-.25.2-.45.45-.45s.45.2.45.45v3.6Zm5.45.45h-.55l-.4-1h-1.9l-.4 1h-.55l1.6-4.05c.06-.16.21-.25.4-.25s.34.09.4.25l1.4 4.05Zm-2.5-1.85h1.3l-.65-1.7-.65 1.7Z" />
    </svg>
  );
}

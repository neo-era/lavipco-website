import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Google Maps embed responsive 16:9.
 *
 * Dùng URL search (không cần API key). Khi production cần độ chính xác cao
 * + style hơn, chuyển sang Maps Embed API và cấu hình NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export function ContactMap() {
  // Fallback khi SITE_CONFIG.address rỗng
  const query = SITE_CONFIG.address || "TP. Hồ Chí Minh, Việt Nam";
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <section className="border-t py-16 md:py-20">
      <Container>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 rounded-full">
            Vị trí
          </Badge>
          <h2 className="text-balance text-3xl font-bold md:text-4xl">
            Tìm chúng tôi trên bản đồ
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{query}</p>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm">
          <div className="relative aspect-video">
            <iframe
              title={`Bản đồ trụ sở ${SITE_CONFIG.name}`}
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

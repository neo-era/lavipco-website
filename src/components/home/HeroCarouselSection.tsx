import { getContent } from "@/lib/content";
import { HeroCarousel } from "@/components/home/HeroCarousel";

/**
 * Server wrapper: đọc nội dung Hero từ CMS (fallback default) rồi truyền xuống
 * HeroCarousel (client component dùng embla).
 */
export async function HeroCarouselSection() {
  const { slides } = await getContent("home_hero");
  return <HeroCarousel slides={slides} />;
}

import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AboutSummary } from "@/components/home/AboutSummary";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { LatestNews } from "@/components/home/LatestNews";
import { HomeCTA } from "@/components/home/HomeCTA";

/**
 * ISR: prerender tại build time, tự revalidate mỗi 60s khi có request.
 * Khi admin update sản phẩm/dự án/blog, content cập nhật trong vòng 1 phút.
 * Cần refresh ngay? Dùng revalidatePath("/") trong Server Action của admin.
 */
export const revalidate = 60;

/**
 * Trang chủ LAVIPCO - 8 sections.
 * Mỗi section là module riêng để dễ maintain. Sections async tự fetch Prisma.
 */
export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <AboutSummary />
      <ServicesGrid />
      <FeaturedProducts />
      <FeaturedProjects />
      <WhyChooseUs />
      <LatestNews />
      <HomeCTA />
    </>
  );
}

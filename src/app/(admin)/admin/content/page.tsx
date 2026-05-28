import type { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";

import { getHomeContent, getAboutContent } from "@/lib/content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeroForm } from "@/components/admin/content/AdminHeroForm";
import { AdminAboutForm } from "@/components/admin/content/AdminAboutForm";
import { AdminServicesHeaderForm } from "@/components/admin/content/AdminServicesHeaderForm";
import { AdminWhyForm } from "@/components/admin/content/AdminWhyForm";
import { AdminCtaForm } from "@/components/admin/content/AdminCtaForm";
import { AdminAboutHeroForm } from "@/components/admin/content/AdminAboutHeroForm";
import { AdminStoryForm } from "@/components/admin/content/AdminStoryForm";
import { AdminVmvForm } from "@/components/admin/content/AdminVmvForm";
import { AdminAboutCtaForm } from "@/components/admin/content/AdminAboutCtaForm";
import { AdminTimelineForm } from "@/components/admin/content/AdminTimelineForm";
import { AdminLeadershipForm } from "@/components/admin/content/AdminLeadershipForm";
import { AdminCertsForm } from "@/components/admin/content/AdminCertsForm";
import { AdminPartnersForm } from "@/components/admin/content/AdminPartnersForm";

export const metadata: Metadata = { title: "Nội dung trang" };

export const dynamic = "force-dynamic";

/**
 * Quản lý nội dung trang chủ + giới thiệu (CMS).
 * Trang chủ (8.2 + 8.3) đã đủ form; trang giới thiệu thêm ở 8.4–8.5.
 */
export default async function AdminContentPage() {
  const [home, about] = await Promise.all([getHomeContent(), getAboutContent()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <LayoutTemplate className="h-6 w-6 text-brand-primary" />
          Nội dung trang
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chỉnh sửa text và hình ảnh của Trang chủ và Trang giới thiệu. Thay đổi
          hiển thị ngay sau khi lưu; bỏ trống sẽ dùng nội dung mặc định.
        </p>
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Trang chủ</TabsTrigger>
          <TabsTrigger value="about">Trang giới thiệu</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-5 space-y-8">
          <ContentBlock title="1. Hero carousel">
            <AdminHeroForm defaultValues={home.hero} />
          </ContentBlock>
          <ContentBlock title="2. Giới thiệu tóm tắt">
            <AdminAboutForm defaultValues={home.about} />
          </ContentBlock>
          <ContentBlock title="3. Tiêu đề khu Dịch vụ">
            <AdminServicesHeaderForm defaultValues={home.servicesHeader} />
          </ContentBlock>
          <ContentBlock title="4. Vì sao chọn chúng tôi">
            <AdminWhyForm defaultValues={home.why} />
          </ContentBlock>
          <ContentBlock title="5. Kêu gọi hành động (CTA)">
            <AdminCtaForm defaultValues={home.cta} />
          </ContentBlock>
        </TabsContent>

        <TabsContent value="about" className="mt-5 space-y-8">
          <ContentBlock title="1. Hero giới thiệu">
            <AdminAboutHeroForm defaultValues={about.hero} />
          </ContentBlock>
          <ContentBlock title="2. Câu chuyện công ty">
            <AdminStoryForm defaultValues={about.story} />
          </ContentBlock>
          <ContentBlock title="3. Tầm nhìn · Sứ mệnh · Giá trị">
            <AdminVmvForm defaultValues={about.vmv} />
          </ContentBlock>
          <ContentBlock title="4. Lịch sử phát triển">
            <AdminTimelineForm defaultValues={about.timeline} />
          </ContentBlock>
          <ContentBlock title="5. Đội ngũ lãnh đạo">
            <AdminLeadershipForm defaultValues={about.leadership} />
          </ContentBlock>
          <ContentBlock title="6. Chứng nhận & tiêu chuẩn">
            <AdminCertsForm defaultValues={about.certs} />
          </ContentBlock>
          <ContentBlock title="7. Đối tác & khách hàng">
            <AdminPartnersForm defaultValues={about.partners} />
          </ContentBlock>
          <ContentBlock title="8. Kêu gọi hành động (CTA)">
            <AdminAboutCtaForm defaultValues={about.cta} />
          </ContentBlock>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="border-l-4 border-brand-primary pl-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}


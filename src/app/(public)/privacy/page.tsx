import type { Metadata } from "next";

import { getContent } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { stripHtmlForMeta } from "@/lib/seo";
import { PolicyLayout, POLICY_PROSE_CLASS } from "@/components/policy/PolicyLayout";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent("policy_privacy");
  return {
    title: `${c.title} | LAVIPCO`,
    description: stripHtmlForMeta(c.body, 160) || c.title,
  };
}

export default async function PrivacyPage() {
  const c = await getContent("policy_privacy");
  return (
    <PolicyLayout
      title={c.title}
      breadcrumbItems={[{ title: c.title }]}
      updatedAt={c.updatedAt}
    >
      <div
        className={POLICY_PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.body) }}
      />
    </PolicyLayout>
  );
}

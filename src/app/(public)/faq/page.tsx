import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

import { getContent } from "@/lib/content";
import { PolicyLayout } from "@/components/policy/PolicyLayout";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent("policy_faq");
  return {
    title: `${c.title} | LAVIPCO`,
    description: (c.intro ?? c.title).slice(0, 160),
  };
}

export default async function FaqPage() {
  const c = await getContent("policy_faq");
  return (
    <PolicyLayout
      title={c.title}
      description={c.intro}
      breadcrumbItems={[{ title: c.title }]}
    >
      <div className="space-y-10">
        {c.groups.map((group, gi) => (
          <section key={gi}>
            <h2 className="mb-3 text-lg font-semibold text-brand-primary">
              {group.name}
            </h2>
            <ul className="space-y-2">
              {group.items.map((item, ii) => (
                <li key={ii}>
                  {/* <details> tự xử lý toggle, không cần JS — accessible sẵn. */}
                  <details className="group rounded-lg border bg-card transition-colors hover:bg-muted/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="whitespace-pre-line border-t bg-background/40 px-4 py-3 text-sm leading-relaxed text-foreground/90">
                      {item.a}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PolicyLayout>
  );
}

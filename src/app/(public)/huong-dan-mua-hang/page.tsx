import type { Metadata } from "next";

import { getContent } from "@/lib/content";
import { PolicyLayout } from "@/components/policy/PolicyLayout";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent("policy_shopping_guide");
  return {
    title: `${c.title} | LAVIPCO`,
    description: c.intro.slice(0, 160),
  };
}

export default async function ShoppingGuidePage() {
  const c = await getContent("policy_shopping_guide");
  return (
    <PolicyLayout
      title={c.title}
      description={c.intro}
      breadcrumbItems={[{ title: c.title }]}
    >
      <ol className="space-y-6">
        {c.steps.map((step, idx) => (
          <li key={idx} className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="mt-1 text-foreground/90">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {c.note && (
        <div className="mt-10 rounded-lg border-l-4 border-brand-primary bg-brand-primary/5 p-4 text-sm text-foreground/90">
          {c.note}
        </div>
      )}
    </PolicyLayout>
  );
}

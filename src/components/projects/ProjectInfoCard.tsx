import { Building2, MapPin, Calendar, Ruler, Tag } from "lucide-react";
import type { ProjectCategory } from "@prisma/client";

import { PROJECT_CATEGORY_META } from "@/lib/projects-data";

type Props = {
  client?: string | null;
  location?: string | null;
  year?: number | null;
  scale?: string | null;
  category: ProjectCategory;
};

/**
 * Bảng thông tin dự án (chủ đầu tư, địa điểm, năm, quy mô, loại).
 * Chỉ render các field có dữ liệu.
 */
export function ProjectInfoCard({ client, location, year, scale, category }: Props) {
  const rows: Array<{ Icon: typeof Tag; label: string; value: string }> = [];
  if (client) rows.push({ Icon: Building2, label: "Chủ đầu tư", value: client });
  if (location) rows.push({ Icon: MapPin, label: "Địa điểm", value: location });
  if (year) rows.push({ Icon: Calendar, label: "Năm thực hiện", value: String(year) });
  if (scale) rows.push({ Icon: Ruler, label: "Quy mô", value: scale });
  rows.push({ Icon: Tag, label: "Loại dự án", value: PROJECT_CATEGORY_META[category].label });

  return (
    <aside className="rounded-xl border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Thông tin dự án
      </h2>
      <dl className="space-y-4">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-medium leading-snug">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </aside>
  );
}

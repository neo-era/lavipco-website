import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getServiceIcon } from "@/lib/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ServiceCardProps = {
  slug: string;
  title: string;
  description: string;
  icon: string | null;
};

export function ServiceCard({ slug, title, description, icon }: ServiceCardProps) {
  const Icon = getServiceIcon(icon);

  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">
          <Link href={`/services/${slug}`} className="hover:text-brand-primary">
            {title}
          </Link>
        </CardTitle>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Link
          href={`/services/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
        >
          Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

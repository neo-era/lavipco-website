import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { ProjectInput } from "@/lib/validations/admin-project";
import { isAIEnabled } from "@/lib/actions/ai-content";
import { Button } from "@/components/ui/button";
import { AdminProjectForm } from "@/components/admin/AdminProjectForm";

export const metadata: Metadata = { title: "Thêm dự án" };

const DEFAULT_VALUES: ProjectInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  client: "",
  location: "",
  year: new Date().getFullYear(),
  scale: "",
  category: "URBAN_LIGHTING",
  images: [],
  videoUrl: "",
  isFeatured: false,
  sortOrder: 0,
};

export default async function NewProjectPage() {
  const aiEnabled = await isAIEnabled();
  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/projects">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm dự án mới</h1>
      </div>
      <AdminProjectForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        aiEnabled={aiEnabled}
      />
    </div>
  );
}

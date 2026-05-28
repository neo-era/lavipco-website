import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { ServiceInput } from "@/lib/validations/admin-service";
import { isAIEnabled } from "@/lib/actions/ai-content";
import { Button } from "@/components/ui/button";
import { AdminServiceForm } from "@/components/admin/AdminServiceForm";

export const metadata: Metadata = { title: "Thêm dịch vụ" };

const DEFAULT_VALUES: ServiceInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  icon: "",
  coverImage: "",
  price: null,
  processSteps: [],
  sortOrder: 0,
  isActive: true,
};

export default async function NewServicePage() {
  const aiEnabled = await isAIEnabled();
  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 h-8">
          <Link href="/admin/services">
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Thêm dịch vụ mới</h1>
      </div>
      <AdminServiceForm
        mode="create"
        defaultValues={DEFAULT_VALUES}
        aiEnabled={aiEnabled}
      />
    </div>
  );
}

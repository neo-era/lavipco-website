import type { ProjectCategory } from "@prisma/client";

import { Pagination } from "@/components/common/Pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  category: ProjectCategory | null;
};

/**
 * Wrapper Pagination cho /projects — giữ nguyên searchParam category khi chuyển trang.
 */
export function ProjectsPagination({ currentPage, totalPages, category }: Props) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      buildPageUrl={buildPageUrl}
    />
  );
}

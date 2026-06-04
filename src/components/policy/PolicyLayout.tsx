import * as React from "react";

import { Container } from "@/components/layout/Container";
import { Breadcrumb, type BreadcrumbItem } from "@/components/common/Breadcrumb";
import { formatDate } from "@/lib/utils";

type Props = {
  /** Tiêu đề lớn của trang (h1). */
  title: string;
  /** Item cuối của breadcrumb — "Trang chủ" tự được Breadcrumb thêm phía trước. */
  breadcrumbItems: BreadcrumbItem[];
  /** ISO date — hiển thị "Cập nhật: dd/MM/yyyy" dưới tiêu đề (cho 4 trang policy HTML). */
  updatedAt?: string;
  /** Mô tả ngắn dưới tiêu đề (cho shopping-guide / FAQ). */
  description?: string;
  children: React.ReactNode;
};

/**
 * Layout dùng chung cho 6 trang Hỗ trợ & Chính sách.
 * Cung cấp Container + Breadcrumb + tiêu đề + (optional) ngày cập nhật.
 * Vùng nội dung KHÔNG được style sẵn — trang tự quyết:
 *  - Trang HTML body: áp `POLICY_PROSE_CLASS` lên wrapper dangerouslySetInnerHTML.
 *  - Trang FAQ / Guide: tự render UI (ol custom, details/summary...).
 */
export function PolicyLayout({
  title,
  breadcrumbItems,
  updatedAt,
  description,
  children,
}: Props) {
  return (
    <Container className="py-10 md:py-14">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 text-muted-foreground md:text-lg">{description}</p>
        )}
        {updatedAt && (
          <p className="mt-3 text-sm text-muted-foreground">
            Cập nhật:{" "}
            <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
          </p>
        )}
      </header>
      <div className="max-w-3xl">{children}</div>
    </Container>
  );
}

/**
 * Tailwind utility class áp lên vùng `dangerouslySetInnerHTML` chứa HTML body
 * (warranty / return / privacy / terms). Style h2/h3/p/ul/ol/a/strong qua
 * arbitrary selectors — không cần plugin @tailwindcss/typography.
 */
export const POLICY_PROSE_CLASS = [
  "text-foreground/90 leading-relaxed",
  "[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-brand-primary",
  "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:my-3",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6",
  "[&_a]:text-brand-primary [&_a]:underline",
  "[&_strong]:font-semibold",
  "[&_em]:italic",
].join(" ");

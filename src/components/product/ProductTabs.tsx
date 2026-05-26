import Link from "next/link";
import { FileText, Download, MessageSquareText } from "lucide-react";

import { formatSpecValue, getSpecLabel } from "@/lib/products-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  description: string | null;
  specs: unknown; // Product.specs (Json | null)
  catalogueUrl: string | null;
};

export function ProductTabs({ description, specs, catalogueUrl }: Props) {
  const specEntries = parseSpecs(specs);
  const hasDescription = Boolean(description && description.trim().length > 0);

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
        <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
        <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
      </TabsList>

      {/* Mô tả */}
      <TabsContent value="description" className="mt-6">
        {hasDescription ? (
          <div className="prose prose-slate max-w-none">
            {description!.split(/\n\s*\n/).map((para, idx) => (
              <p key={idx} className="text-base leading-relaxed text-muted-foreground">
                {para.trim()}
              </p>
            ))}
          </div>
        ) : (
          <EmptyState
            Icon={FileText}
            message="Đang cập nhật mô tả chi tiết. Liên hệ LAVIPCO để xem hồ sơ kỹ thuật đầy đủ."
          />
        )}
      </TabsContent>

      {/* Specs - bảng 2 cột */}
      <TabsContent value="specs" className="mt-6">
        {specEntries.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody>
                {specEntries.map(([key, value], idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? "bg-muted/30" : "bg-background"}
                  >
                    <th
                      scope="row"
                      className="w-1/3 px-4 py-3 text-left font-medium text-foreground/80"
                    >
                      {getSpecLabel(key)}
                    </th>
                    <td className="px-4 py-3 text-foreground">
                      {formatSpecValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            Icon={FileText}
            message="Chưa có thông số kỹ thuật. Liên hệ để nhận thông số chi tiết theo cấu hình."
          />
        )}
      </TabsContent>

      {/* Đánh giá - placeholder */}
      <TabsContent value="reviews" className="mt-6">
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <MessageSquareText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Đánh giá đang được phát triển</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Khách hàng đã mua sản phẩm sẽ có thể gửi đánh giá và xếp hạng (1-5 sao)
            ở phiên bản kế tiếp.
          </p>
          <Badge variant="outline" className="mt-4">
            Sẽ ra mắt
          </Badge>
        </div>
      </TabsContent>

      {/* Catalogue */}
      <TabsContent value="catalogue" className="mt-6">
        {catalogueUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Catalogue sản phẩm</p>
                <p className="text-sm text-muted-foreground">
                  Tài liệu kỹ thuật PDF chi tiết
                </p>
              </div>
            </div>
            <Button asChild variant="brand">
              <Link href={catalogueUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Tải catalogue
              </Link>
            </Button>
          </div>
        ) : (
          <EmptyState
            Icon={FileText}
            message="Catalogue chưa được upload. Liên hệ LAVIPCO để nhận tài liệu kỹ thuật qua email."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({
  Icon,
  message,
}: {
  Icon: typeof FileText;
  message: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Parse Product.specs (Json) thành [key, value][] cho table.
 * Bỏ qua null/undefined/empty string.
 */
function parseSpecs(specs: unknown): Array<[string, unknown]> {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
  return Object.entries(specs as Record<string, unknown>).filter(([, value]) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

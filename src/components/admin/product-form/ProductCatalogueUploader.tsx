"use client";

/**
 * Catalogue PDF uploader cho ProductForm (field "catalogueUrl").
 *
 * Flow giống ProductImageUploader:
 *  - Admin chọn file PDF → đọc thành data URL (base64) → set vào field.
 *  - Upload Cloudinary diễn ra ở server action khi save (xem processCatalogue
 *    trong lib/actions/admin-products.ts).
 *
 * Field value có 3 trạng thái:
 *  - ""                         : chưa có catalogue.
 *  - "https://..."              : URL Cloudinary đã lưu (edit mode) → hiển thị link.
 *  - "data:application/pdf;..." : file vừa chọn, chưa upload → chờ lưu.
 *
 * Giới hạn 15MB để khớp serverActions.bodySizeLimit ở next.config.mjs.
 */
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Upload, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { ProductInput } from "@/lib/validations/admin-product";

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ProductCatalogueUploader() {
  const form = useFormContext<ProductInput>();
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Tên file local (chỉ có khi vừa chọn — data URL không mang tên file)
  const [fileName, setFileName] = React.useState<string | null>(null);

  const raw = form.watch("catalogueUrl");
  const value = typeof raw === "string" ? raw : "";
  const hasValue = value.length > 0;
  const isUrl = value.startsWith("http://") || value.startsWith("https://");

  function commit(next: string | null) {
    form.setValue("catalogueUrl", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast({
        title: "Định dạng không hỗ trợ",
        description: `${file.name}: chỉ chấp nhận file PDF.`,
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: "File quá lớn",
        description: `${file.name} > 15MB. Vui lòng nén PDF trước khi tải lên.`,
        variant: "destructive",
      });
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      commit(dataUrl);
      setFileName(file.name);
    } catch {
      toast({
        title: "Lỗi đọc file",
        description: file.name,
        variant: "destructive",
      });
    }
  }

  function clear() {
    commit(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {!hasValue && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-center transition-colors hover:border-brand-primary/40 hover:bg-muted/50">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            Chọn file PDF{" "}
            <span className="font-normal text-muted-foreground">(≤ 15MB)</span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              // Reset để cho phép chọn lại cùng file
              e.target.value = "";
            }}
          />
        </label>
      )}

      {hasValue && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
          <FileText className="h-5 w-5 shrink-0 text-brand-primary" />
          <div className="min-w-0 flex-1 text-sm">
            {isUrl ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-brand-primary underline"
                title={value}
              >
                {decodeURIComponent(value.split("/").pop() || "catalogue.pdf")}
              </a>
            ) : (
              <span className="block truncate">
                {fileName ?? "Catalogue mới"}{" "}
                <span className="text-xs text-amber-600">• sẽ upload khi lưu</span>
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            onClick={clear}
            aria-label="Xoá catalogue"
            title="Xoá catalogue"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

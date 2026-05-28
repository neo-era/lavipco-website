"use client";

/**
 * Dialog import Excel dùng chung cho mọi entity.
 * - Tải file mẫu (link)
 * - Upload .xlsx → đọc base64 → onParse (validate-only) → preview
 * - Xác nhận → onConfirm (import thật) → tóm tắt
 *
 * onParse/onConfirm là Server Action nhận base64 (chuỗi) của file.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileDown, Loader2, CheckCircle2, Pencil, XCircle } from "lucide-react";

import type { ImportResult, RowResult } from "@/lib/excel/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  entityLabel: string;
  templateHref: string;
  onParse: (base64: string) => Promise<ImportResult>;
  onConfirm: (base64: string) => Promise<ImportResult>;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImportDialog({ entityLabel, templateHref, onParse, onConfirm }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [base64, setBase64] = React.useState("");
  const [preview, setPreview] = React.useState<ImportResult | null>(null);
  const [pending, setPending] = React.useState(false);

  function reset() {
    setFileName("");
    setBase64("");
    setPreview(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast({ title: "Sai định dạng", description: "Chỉ nhận file .xlsx", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File quá lớn", description: "Tối đa 5MB", variant: "destructive" });
      return;
    }
    setPending(true);
    try {
      const b64 = await fileToBase64(file);
      setBase64(b64);
      setFileName(file.name);
      const res = await onParse(b64);
      setPreview(res);
    } catch (e) {
      toast({
        title: "Không đọc được file",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  async function handleConfirm() {
    if (!base64) return;
    setPending(true);
    try {
      const res = await onConfirm(base64);
      toast({
        title: "✓ Import xong",
        description: `${res.created} tạo mới · ${res.updated} cập nhật · ${res.errors} lỗi`,
      });
      setPreview(res);
      router.refresh();
      if (res.errors === 0) {
        setOpen(false);
        reset();
      }
    } catch (e) {
      toast({
        title: "Import thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  }

  const validCount = preview ? preview.created + preview.updated : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" /> Nhập từ Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nhập {entityLabel} từ Excel</DialogTitle>
          <DialogDescription>
            Tải file mẫu, điền dữ liệu, rồi tải lên. Dòng có slug đã tồn tại sẽ được
            cập nhật. Ảnh dán URL (không nhúng file).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <a href={templateHref} download>
                <FileDown className="h-4 w-4" /> Tải file mẫu
              </a>
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm hover:border-brand-primary/50 hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              {fileName || "Chọn file .xlsx"}
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                disabled={pending}
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {preview && (
            <>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="brand" className="rounded-full">
                  {preview.created} tạo mới
                </Badge>
                <Badge variant="accent" className="rounded-full">
                  {preview.updated} cập nhật
                </Badge>
                <Badge variant="destructive" className="rounded-full">
                  {preview.errors} lỗi
                </Badge>
              </div>

              <div className="max-h-[40vh] overflow-y-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Dòng</th>
                      <th className="px-3 py-2 text-left">Kết quả</th>
                      <th className="px-3 py-2 text-left">Slug / Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <RowItem key={r.rowIndex} row={r} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="brand"
                  onClick={handleConfirm}
                  disabled={pending || validCount === 0}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Xác nhận import ({validCount} dòng hợp lệ)
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RowItem({ row }: { row: RowResult }) {
  const meta =
    row.action === "create"
      ? { icon: <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />, label: "Tạo mới" }
      : row.action === "update"
        ? { icon: <Pencil className="h-3.5 w-3.5 text-amber-600" />, label: "Cập nhật" }
        : { icon: <XCircle className="h-3.5 w-3.5 text-destructive" />, label: "Lỗi" };
  return (
    <tr className="border-t">
      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.rowIndex}</td>
      <td className="px-3 py-2">
        <span className="inline-flex items-center gap-1">
          {meta.icon} {meta.label}
        </span>
      </td>
      <td className="px-3 py-2">
        {row.action === "error" ? (
          <span className="text-destructive">{row.messages?.join("; ")}</span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">{row.slug}</span>
        )}
      </td>
    </tr>
  );
}

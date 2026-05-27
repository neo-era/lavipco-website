"use client";

/**
 * Generic image uploader cho admin forms.
 *
 * Hai mode:
 *  - multi (mặc định): mảng URL/dataURL, có reorder + set cover + xoá từng ảnh.
 *  - single: 1 string URL/dataURL.
 *
 * Render trong react-hook-form FormProvider context. Caller chỉ cần pass
 * fieldName + (optional) maxImages. Component đọc/ghi field qua form.watch +
 * form.setValue, validate ở Zod schema phía caller.
 *
 * Upload file → data URL. Server action sẽ chuyển sang Cloudinary khi save
 * (xem lib/cloudinary.ts).
 */
import * as React from "react";
import Image from "next/image";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { Upload, X, ArrowUp, ArrowDown, Star } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type BaseProps = {
  /** Tên field trong react-hook-form. */
  name: string;
  /** Hint hiển thị dưới dropzone. */
  hint?: string;
};

type MultiProps = BaseProps & {
  mode?: "multi";
  maxImages?: number;
};

type SingleProps = BaseProps & {
  mode: "single";
};

export function ImageUploader<TFieldValues extends FieldValues = FieldValues>(
  props: MultiProps | SingleProps,
) {
  const form = useFormContext<TFieldValues>();
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const mode = props.mode ?? "multi";
  const isSingle = mode === "single";
  const maxImages = isSingle ? 1 : ((props as MultiProps).maxImages ?? 20);

  // Read current value qua watch
  const raw = form.watch(props.name as Path<TFieldValues>);
  const images: string[] = isSingle
    ? typeof raw === "string" && raw
      ? [raw]
      : []
    : Array.isArray(raw)
      ? (raw as string[])
      : [];

  function commit(next: string[]) {
    const value = isSingle ? (next[0] ?? "") : next;
    form.setValue(props.name as Path<TFieldValues>, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;

    if (!isSingle && images.length + arr.length > maxImages) {
      toast({
        title: "Quá số lượng ảnh",
        description: `Tối đa ${maxImages} ảnh. Hiện đã có ${images.length}.`,
        variant: "destructive",
      });
      return;
    }

    const added: string[] = [];
    for (const file of arr) {
      if (!ACCEPTED.includes(file.type)) {
        toast({
          title: "Định dạng không hỗ trợ",
          description: `${file.name}: JPG/PNG/WEBP/AVIF.`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast({
          title: "File quá lớn",
          description: `${file.name} > 5MB. Nén ảnh trước khi tải lên.`,
          variant: "destructive",
        });
        continue;
      }
      try {
        const dataUrl = await fileToDataURL(file);
        added.push(dataUrl);
      } catch {
        toast({
          title: "Lỗi đọc file",
          description: file.name,
          variant: "destructive",
        });
      }
    }
    if (added.length > 0) {
      if (isSingle) {
        commit([added[0]]); // single = replace
      } else {
        commit([...images, ...added]);
      }
    }
  }

  function removeAt(idx: number) {
    commit(images.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  }

  function setCover(idx: number) {
    if (idx === 0) return;
    const next = [images[idx], ...images.filter((_, i) => i !== idx)];
    commit(next);
  }

  const dropzoneHint =
    props.hint ??
    (isSingle
      ? "JPG / PNG / WEBP / AVIF — 1 ảnh, ≤ 5MB"
      : `JPG / PNG / WEBP / AVIF — tối đa ${maxImages} ảnh, mỗi ảnh ≤ 5MB`);

  return (
    <div className="space-y-4">
      {/* Dropzone (ẩn khi single mà đã có ảnh) */}
      {(!isSingle || images.length === 0) && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-center transition-colors hover:border-brand-primary/40 hover:bg-muted/50",
            dragOver ? "border-brand-primary bg-brand-primary/5" : "border-border",
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Kéo thả ảnh vào đây hoặc{" "}
              <span className="text-brand-primary">click để chọn</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{dropzoneHint}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple={!isSingle}
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {/* Preview */}
      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            isSingle
              ? "max-w-xs"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
          )}
        >
          {images.map((src, idx) => (
            <div
              key={`${src.slice(0, 32)}-${idx}`}
              className="group relative overflow-hidden rounded-lg border bg-muted"
            >
              <div className="relative aspect-square">
                <Image
                  src={src}
                  alt={`Ảnh ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                  unoptimized={src.startsWith("data:")}
                />
                {!isSingle && idx === 0 && (
                  <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-md bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-white" />
                    Bìa
                  </span>
                )}
              </div>
              <div className="flex justify-between border-t bg-background/95 p-1">
                {!isSingle && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Lên"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => move(idx, 1)}
                      disabled={idx === images.length - 1}
                      aria-label="Xuống"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCover(idx)}
                      disabled={idx === 0}
                      aria-label="Đặt làm ảnh bìa"
                      title="Đặt làm ảnh bìa"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeAt(idx)}
                  aria-label="Xoá"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSingle && images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Ảnh đầu tiên là <strong>ảnh bìa</strong>. Click ⭐ để đặt ảnh khác làm bìa.
        </p>
      )}
    </div>
  );
}

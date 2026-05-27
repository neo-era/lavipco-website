"use client";

/**
 * Image uploader cho ProductForm:
 *  - Drag/drop hoặc click chọn file.
 *  - Đọc file → data URL → push vào field.value (mảng URL/dataURL).
 *  - Cloudinary upload diễn ra ở server action khi save (xem lib/cloudinary.ts).
 *  - Hiển thị preview grid, có thể xoá từng ảnh + sắp xếp drag.
 *  - Max 20 ảnh, mỗi ảnh ≤ 5MB.
 */
import * as React from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Upload, X, ArrowUp, ArrowDown, Star } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProductInput } from "@/lib/validations/admin-product";

const MAX_IMAGES = 20;
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

export function ProductImageUploader() {
  const form = useFormContext<ProductInput>();
  const { toast } = useToast();
  const images = form.watch("images");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;

    if (images.length + arr.length > MAX_IMAGES) {
      toast({
        title: "Quá số lượng ảnh",
        description: `Tối đa ${MAX_IMAGES} ảnh. Hiện đã có ${images.length}.`,
        variant: "destructive",
      });
      return;
    }

    const added: string[] = [];
    for (const file of arr) {
      if (!ACCEPTED.includes(file.type)) {
        toast({
          title: "Định dạng không hỗ trợ",
          description: `${file.name}: chỉ chấp nhận JPG/PNG/WEBP/AVIF.`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast({
          title: "File quá lớn",
          description: `${file.name} > 5MB. Vui lòng nén ảnh trước khi tải lên.`,
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
      form.setValue("images", [...images, ...added], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function removeAt(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    form.setValue("images", next, { shouldDirty: true, shouldValidate: true });
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    form.setValue("images", next, { shouldDirty: true });
  }

  function setCover(idx: number) {
    if (idx === 0) return;
    const next = [images[idx], ...images.filter((_, i) => i !== idx)];
    form.setValue("images", next, { shouldDirty: true });
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
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
            Kéo thả ảnh vào đây hoặc <span className="text-brand-primary">click để chọn</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG / PNG / WEBP / AVIF — tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ 5MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            // Reset input để cho phép re-upload cùng file
            e.target.value = "";
          }}
        />
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
                {idx === 0 && (
                  <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-md bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-white" />
                    Bìa
                  </span>
                )}
              </div>
              {/* Controls */}
              <div className="flex justify-between border-t bg-background/95 p-1">
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

      <p className="text-xs text-muted-foreground">
        Ảnh đầu tiên là <strong>ảnh bìa</strong> hiển thị trong danh sách và OG. Click ⭐ để đặt
        ảnh bất kỳ làm bìa.
      </p>
    </div>
  );
}

"use client";

/**
 * Repeater nhập thông số kỹ thuật: { key, value, unit }.
 * Mỗi spec là 1 hàng grid 3-cell. Có thể thêm/xoá/sắp xếp.
 */
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductInput } from "@/lib/validations/admin-product";

const SPEC_PRESETS = [
  "Công suất",
  "Điện áp",
  "Nhiệt độ màu",
  "Quang thông",
  "Chỉ số IP",
  "Tuổi thọ",
  "Vật liệu",
  "Kích thước",
  "Trọng lượng",
  "Bảo hành",
];

export function ProductSpecsRepeater() {
  const form = useFormContext<ProductInput>();
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "specs",
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          Chưa có thông số nào. Bấm <strong>+ Thêm thông số</strong> để bắt đầu.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden grid-cols-[24px_1fr_1.5fr_120px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground md:grid">
            <span />
            <span>Tên thông số</span>
            <span>Giá trị</span>
            <span>Đơn vị</span>
            <span />
          </div>
          {fields.map((f, idx) => (
            <div
              key={f.id}
              className="grid grid-cols-1 items-start gap-2 rounded-md border bg-card p-2 md:grid-cols-[24px_1fr_1.5fr_120px_40px]"
            >
              {/* Drag handle (placeholder — chỉ move bằng button trên/dưới) */}
              <div className="hidden items-center justify-center text-muted-foreground md:flex">
                <GripVertical className="h-4 w-4" />
              </div>

              <Input
                {...form.register(`specs.${idx}.key`)}
                placeholder="VD: Công suất"
                list="spec-presets"
              />
              <Input
                {...form.register(`specs.${idx}.value`)}
                placeholder="VD: 100"
              />
              <Input
                {...form.register(`specs.${idx}.unit`)}
                placeholder="VD: W"
              />
              <div className="flex justify-end gap-1">
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => move(idx, idx - 1)}
                    aria-label="Lên"
                  >
                    ↑
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => remove(idx)}
                  aria-label="Xoá"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ key: "", value: "", unit: "" })}
      >
        <Plus className="h-4 w-4" />
        Thêm thông số
      </Button>

      {/* Datalist preset gợi ý tên thông số */}
      <datalist id="spec-presets">
        {SPEC_PRESETS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

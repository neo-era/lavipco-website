"use client";

/**
 * Combination variant builder.
 *
 * Cách hoạt động:
 *  1. Admin định nghĩa các thuộc tính: vd "Màu sắc" có giá trị ["Đỏ", "Xanh"],
 *     "Công suất" có ["100W", "150W"].
 *  2. Bấm "Sinh biến thể" → cartesian product → tạo các variant với
 *     attributes = { "Màu sắc": "Đỏ", "Công suất": "100W" }.
 *  3. Admin nhập SKU, giá, tồn kho cho từng variant. Có thể đánh dấu 1 default.
 *
 * Nếu hasVariants=false → form hiển thị simpleStock + auto-tạo 1 variant
 * default lúc save (xem actions/admin-products.ts normalizeVariants).
 */
import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { ProductInput } from "@/lib/validations/admin-product";

type AttributeDef = {
  name: string;
  values: string[];
};

type Props = {
  /** Slug sản phẩm để gợi ý SKU prefix. */
  slug: string;
};

export function ProductVariantBuilder({ slug }: Props) {
  const form = useFormContext<ProductInput>();
  const { toast } = useToast();

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Local UI state cho attribute definitions
  const [attrs, setAttrs] = React.useState<AttributeDef[]>([]);
  const [newAttrName, setNewAttrName] = React.useState("");
  const [newValueInputs, setNewValueInputs] = React.useState<string[]>([]);

  // Init attrs từ variants hiện có (mode edit)
  React.useEffect(() => {
    if (fields.length > 0 && attrs.length === 0) {
      const collected = new Map<string, Set<string>>();
      for (const v of form.getValues("variants")) {
        if (v.attributes) {
          for (const [k, val] of Object.entries(v.attributes)) {
            if (!collected.has(k)) collected.set(k, new Set());
            collected.get(k)!.add(val);
          }
        }
      }
      if (collected.size > 0) {
        setAttrs(
          Array.from(collected.entries()).map(([name, values]) => ({
            name,
            values: Array.from(values),
          })),
        );
        setNewValueInputs(Array.from(collected.keys()).map(() => ""));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAttribute() {
    const name = newAttrName.trim();
    if (!name) return;
    if (attrs.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      toast({
        title: "Thuộc tính trùng",
        description: `Đã có thuộc tính "${name}".`,
        variant: "destructive",
      });
      return;
    }
    setAttrs([...attrs, { name, values: [] }]);
    setNewValueInputs([...newValueInputs, ""]);
    setNewAttrName("");
  }

  function removeAttribute(idx: number) {
    setAttrs(attrs.filter((_, i) => i !== idx));
    setNewValueInputs(newValueInputs.filter((_, i) => i !== idx));
  }

  function addValueToAttr(attrIdx: number) {
    const value = newValueInputs[attrIdx]?.trim();
    if (!value) return;
    const next = [...attrs];
    if (next[attrIdx].values.includes(value)) {
      toast({
        title: "Giá trị trùng",
        description: `"${value}" đã có trong "${next[attrIdx].name}".`,
        variant: "destructive",
      });
      return;
    }
    next[attrIdx] = { ...next[attrIdx], values: [...next[attrIdx].values, value] };
    setAttrs(next);
    const inputs = [...newValueInputs];
    inputs[attrIdx] = "";
    setNewValueInputs(inputs);
  }

  function removeValueFromAttr(attrIdx: number, value: string) {
    const next = [...attrs];
    next[attrIdx] = {
      ...next[attrIdx],
      values: next[attrIdx].values.filter((v) => v !== value),
    };
    setAttrs(next);
  }

  function generateCombinations() {
    if (attrs.length === 0 || attrs.some((a) => a.values.length === 0)) {
      toast({
        title: "Thiếu dữ liệu",
        description: "Mỗi thuộc tính cần ít nhất 1 giá trị.",
        variant: "destructive",
      });
      return;
    }

    // Cartesian product
    const combos: Record<string, string>[] = attrs.reduce<Record<string, string>[]>(
      (acc, attr) => {
        if (acc.length === 0) {
          return attr.values.map((v) => ({ [attr.name]: v }));
        }
        return acc.flatMap((existing) =>
          attr.values.map((v) => ({ ...existing, [attr.name]: v })),
        );
      },
      [],
    );

    if (combos.length > 50) {
      toast({
        title: "Quá nhiều biến thể",
        description: `Sinh ra ${combos.length} biến thể, tối đa 50. Hãy giảm số giá trị.`,
        variant: "destructive",
      });
      return;
    }

    // Map combination → existing variant theo attributes match
    const existing = form.getValues("variants");
    const skuPrefix = slug
      ? slug
          .toUpperCase()
          .replace(/[^A-Z0-9-]/g, "")
          .slice(0, 50)
      : "SP";

    const newVariants = combos.map((combo, idx) => {
      const match = existing.find(
        (v) =>
          v.attributes &&
          Object.keys(combo).length === Object.keys(v.attributes).length &&
          Object.entries(combo).every(([k, val]) => v.attributes?.[k] === val),
      );
      const variantName = Object.values(combo).join(" / ");
      const suffix = Object.values(combo)
        .map((v) => slugify(v).toUpperCase().replace(/-/g, "").slice(0, 8))
        .join("-");
      return {
        id: match?.id,
        sku: match?.sku ?? `${skuPrefix}-${suffix || String(idx + 1).padStart(2, "0")}`,
        name: variantName,
        price: match?.price ?? 0,
        stock: match?.stock ?? 0,
        isDefault: match?.isDefault ?? idx === 0,
        attributes: combo,
      };
    });

    // Replace toàn bộ variants
    form.setValue("variants", newVariants, { shouldDirty: true, shouldValidate: true });
    toast({
      title: `✓ Đã sinh ${newVariants.length} biến thể`,
      description: "Vui lòng kiểm tra SKU, giá và tồn kho cho từng biến thể.",
    });
  }

  function setDefaultVariant(idx: number) {
    const list = form.getValues("variants");
    list.forEach((_, i) => {
      update(i, { ...list[i], isDefault: i === idx });
    });
  }

  return (
    <div className="space-y-5">
      {/* Section 1: Định nghĩa thuộc tính */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div>
          <h4 className="text-sm font-semibold">Bước 1: Định nghĩa thuộc tính</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ví dụ: <em>&quot;Màu sắc&quot;</em> có giá trị{" "}
            <em>&quot;Đỏ&quot;</em>, <em>&quot;Xanh&quot;</em>;{" "}
            <em>&quot;Công suất&quot;</em> có <em>&quot;100W&quot;</em>,{" "}
            <em>&quot;150W&quot;</em>.
          </p>
        </div>

        {/* Thêm thuộc tính mới */}
        <div className="flex gap-2">
          <Input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="Tên thuộc tính (vd: Màu sắc)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAttribute();
              }
            }}
          />
          <Button type="button" onClick={addAttribute} disabled={!newAttrName.trim()}>
            <Plus className="h-4 w-4" />
            Thêm thuộc tính
          </Button>
        </div>

        {/* List attributes */}
        {attrs.map((attr, attrIdx) => (
          <div key={attr.name} className="space-y-2 rounded-md border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{attr.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeAttribute(attrIdx)}
                aria-label="Xoá thuộc tính"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {attr.values.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1 pr-1 text-xs">
                  {v}
                  <button
                    type="button"
                    onClick={() => removeValueFromAttr(attrIdx, v)}
                    className="rounded-full hover:bg-destructive/20"
                    aria-label={`Xoá ${v}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newValueInputs[attrIdx] ?? ""}
                onChange={(e) => {
                  const next = [...newValueInputs];
                  next[attrIdx] = e.target.value;
                  setNewValueInputs(next);
                }}
                placeholder={`Giá trị cho ${attr.name}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addValueToAttr(attrIdx);
                  }
                }}
                className="h-9 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addValueToAttr(attrIdx)}
                disabled={!newValueInputs[attrIdx]?.trim()}
              >
                Thêm
              </Button>
            </div>
          </div>
        ))}

        {attrs.length > 0 && (
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={generateCombinations}
          >
            Sinh biến thể từ tổ hợp
          </Button>
        )}
      </div>

      {/* Section 2: Bảng variants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            Bước 2: Chi tiết biến thể{" "}
            <span className="text-muted-foreground">({fields.length})</span>
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                sku: "",
                name: "",
                price: 0,
                stock: 0,
                isDefault: fields.length === 0,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Thêm thủ công
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            Chưa có biến thể nào. Định nghĩa thuộc tính ở trên và bấm
            <strong> Sinh biến thể từ tổ hợp</strong>, hoặc thêm thủ công.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((f, idx) => {
              const variant = form.watch(`variants.${idx}`);
              return (
                <div
                  key={f.id}
                  className="grid grid-cols-1 gap-2 rounded-md border bg-card p-3 lg:grid-cols-[1fr_2fr_1fr_120px_120px_40px]"
                >
                  <FormField
                    control={form.control}
                    name={`variants.${idx}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">SKU</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="DEN-100W-RED"
                            className="h-9 font-mono text-xs uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${idx}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tên biến thể</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="VD: 100W - Đỏ"
                            className="h-9 text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* Display attributes */}
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Thuộc tính</p>
                    <div className="flex flex-wrap gap-1">
                      {variant?.attributes &&
                        Object.entries(variant.attributes).map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[10px]">
                            {k}: {v}
                          </Badge>
                        ))}
                      {(!variant?.attributes ||
                        Object.keys(variant.attributes).length === 0) && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`variants.${idx}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Giá (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            className="h-9 text-right tabular-nums"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${idx}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tồn kho</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            className="h-9 text-right tabular-nums"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col items-end gap-1 pt-5">
                    <Button
                      type="button"
                      variant={variant?.isDefault ? "brand" : "ghost"}
                      size="sm"
                      className="h-7 px-2 text-[10px]"
                      onClick={() => setDefaultVariant(idx)}
                      title="Đặt làm mặc định"
                    >
                      {variant?.isDefault ? "✓ Mặc định" : "Đặt mặc định"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => remove(idx)}
                      aria-label="Xoá biến thể"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

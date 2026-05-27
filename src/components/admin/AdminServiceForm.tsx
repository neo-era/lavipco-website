"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";

import {
  serviceInputSchema,
  type ServiceInput,
} from "@/lib/validations/admin-service";
import {
  createService,
  updateService,
} from "@/lib/actions/admin-services";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/admin/shared/ImageUploader";

type Props = {
  mode: "create" | "edit";
  serviceId?: string;
  defaultValues: ServiceInput;
};

const LUCIDE_ICON_PRESETS = [
  "Lightbulb",
  "TrafficCone",
  "Zap",
  "Building2",
  "Wrench",
  "Lamp",
  "Plug",
  "Cpu",
  "Wifi",
  "Settings",
];

export function AdminServiceForm({ mode, serviceId, defaultValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "processSteps",
  });

  const watchedTitle = form.watch("title");
  const watchedSlug = form.watch("slug");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");

  React.useEffect(() => {
    if (!slugTouched && watchedTitle) {
      form.setValue("slug", slugify(watchedTitle));
    }
  }, [watchedTitle, slugTouched, form]);

  async function onSubmit(values: ServiceInput) {
    const res =
      mode === "create"
        ? await createService(values)
        : await updateService(serviceId!, values);
    if (!res.ok) {
      if (res.fieldErrors) {
        (Object.entries(res.fieldErrors) as [keyof ServiceInput, string[]][]).forEach(
          ([f, msgs]) => {
            if (msgs?.[0]) form.setError(f, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo dịch vụ thất bại" : "Cập nhật thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: mode === "create" ? "✓ Đã tạo dịch vụ" : "✓ Đã cập nhật dịch vụ",
      description: values.title,
    });
    if (mode === "create" && res.data?.id) {
      router.push(`/admin/services/${res.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 pb-24"
        >
          {/* Card 1: cơ bản */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">1. Thông tin cơ bản</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: Đèn tín hiệu giao thông" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Slug URL <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        setSlugTouched(true);
                        field.onChange(e.target.value);
                      }}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    URL: /services/<strong>{watchedSlug || "..."}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                      maxLength={500}
                      placeholder="1-2 câu hiển thị ở card list."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {(field.value ?? "").length}/500 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mô tả chi tiết <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      maxLength={20_000}
                      placeholder="Hỗ trợ Markdown: **bold**, *italic*, - bullet."
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {field.value.length.toLocaleString()}/20.000 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Card 2: icon + cover + price */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">2. Hiển thị</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="VD: Lightbulb, TrafficCone..."
                        list="lucide-icon-presets"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tên Lucide icon (xem lucide.dev) hoặc URL ảnh SVG. Preset gợi ý:{" "}
                      {LUCIDE_ICON_PRESETS.slice(0, 5).join(", ")}...
                    </FormDescription>
                    <datalist id="lucide-icon-presets">
                      {LUCIDE_ICON_PRESETS.map((i) => (
                        <option key={i} value={i} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VND)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                        placeholder="Để trống = Liên hệ báo giá"
                        className="text-right tabular-nums"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Để trống = hiển thị &quot;Liên hệ báo giá&quot;.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormLabel>Ảnh bìa</FormLabel>
              <div className="mt-2">
                <ImageUploader name="coverImage" mode="single" />
              </div>
              <FormField
                control={form.control}
                name="coverImage"
                render={() => <FormMessage />}
              />
            </div>
          </Card>

          {/* Card 3: quy trình */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">3. Quy trình thực hiện</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hiển thị dạng các bước ở trang chi tiết dịch vụ. Tối đa 20 bước.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", description: "" })}
              >
                <Plus className="h-4 w-4" /> Thêm bước
              </Button>
            </div>
            {fields.length === 0 ? (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                Chưa có bước nào. Bấm <strong>+ Thêm bước</strong> để bắt đầu.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-1 gap-2 rounded-md border bg-card p-3 md:grid-cols-[40px_1fr_2fr_40px]"
                  >
                    <div className="flex items-center justify-center text-sm font-semibold text-brand-primary">
                      {idx + 1}
                    </div>
                    <FormField
                      control={form.control}
                      name={`processSteps.${idx}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Tên bước" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`processSteps.${idx}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              placeholder="Mô tả ngắn (optional)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                ))}
              </div>
            )}
          </Card>

          {/* Card 4: cấu hình */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">4. Cấu hình</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Hiển thị</FormLabel>
                      <FormDescription className="text-xs">
                        Tắt để ẩn dịch vụ khỏi trang public.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        className="text-right tabular-nums"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Số nhỏ hiển thị trước.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Sticky bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:left-64">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {form.formState.isDirty
                  ? "● Có thay đổi chưa lưu"
                  : "Sẵn sàng lưu"}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" type="button">
                  <Link href="/admin/services">
                    <X className="h-4 w-4" /> Huỷ
                  </Link>
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "create" ? "Tạo dịch vụ" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

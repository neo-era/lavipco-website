"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import {
  categoryInputSchema,
  type CategoryInput,
} from "@/lib/validations/admin-category";
import {
  createCategory,
  updateCategory,
} from "@/lib/actions/admin-categories";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const NONE_VALUE = "__none__";

type ParentOption = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues: CategoryInput;
  parentOptions: ParentOption[];
};

export function AdminCategoryForm({
  mode,
  categoryId,
  defaultValues,
  parentOptions,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");

  React.useEffect(() => {
    if (!slugTouched && watchedName) {
      form.setValue("slug", slugify(watchedName));
    }
  }, [watchedName, slugTouched, form]);

  async function onSubmit(values: CategoryInput) {
    const res =
      mode === "create"
        ? await createCategory(values)
        : await updateCategory(categoryId!, values);
    if (!res.ok) {
      if (res.fieldErrors) {
        (Object.entries(res.fieldErrors) as [keyof CategoryInput, string[]][]).forEach(
          ([f, msgs]) => {
            if (msgs?.[0]) form.setError(f, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo danh mục thất bại" : "Cập nhật thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: mode === "create" ? "✓ Đã tạo danh mục" : "✓ Đã cập nhật danh mục",
      description: values.name,
    });
    if (mode === "create" && res.data?.id) {
      router.push(`/admin/categories/${res.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-24">
          {/* Card 1: cơ bản */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">1. Thông tin cơ bản</h2>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: Đèn LED đường phố" />
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
                    Lọc sản phẩm: /products?category=
                    <strong>{watchedSlug || "..."}</strong>
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
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={3}
                      maxLength={2000}
                      placeholder="Mô tả ngắn về danh mục (optional)."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {(field.value ?? "").length}/2000 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Card 2: phân cấp + ảnh */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">2. Phân cấp &amp; hình ảnh</h2>
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục cha</FormLabel>
                  <Select
                    value={field.value ?? NONE_VALUE}
                    onValueChange={(v) =>
                      field.onChange(v === NONE_VALUE ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>
                        — Không có (danh mục gốc)
                      </SelectItem>
                      {parentOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    Để trống nếu đây là danh mục cấp gốc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Ảnh đại diện</FormLabel>
              <div className="mt-2">
                <ImageUploader name="image" mode="single" />
              </div>
              <FormField
                control={form.control}
                name="image"
                render={() => <FormMessage />}
              />
            </div>
          </Card>

          {/* Card 3: cấu hình */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">3. Cấu hình</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Hiển thị</FormLabel>
                      <FormDescription className="text-xs">
                        Tắt để ẩn danh mục khỏi trang public.
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
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                {form.formState.isDirty ? "● Có thay đổi chưa lưu" : "Sẵn sàng lưu"}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" type="button">
                  <Link href="/admin/categories">
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
                  {mode === "create" ? "Tạo danh mục" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

"use client";

/**
 * Form CRUD dự án - reuse ImageUploader (multi) + slug auto-fill.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import {
  projectInputSchema,
  type ProjectInput,
  PROJECT_CATEGORY_LABELS,
  type ProjectCategoryValue,
} from "@/lib/validations/admin-project";
import {
  createProject,
  updateProject,
} from "@/lib/actions/admin-projects";
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
import { AIGenerateButton } from "@/components/admin/shared/AIGenerateButton";

type Props = {
  mode: "create" | "edit";
  projectId?: string;
  defaultValues: ProjectInput;
  aiEnabled?: boolean;
};

export function AdminProjectForm({
  mode,
  projectId,
  defaultValues,
  aiEnabled = false,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const watchedTitle = form.watch("title");
  const watchedSlug = form.watch("slug");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");

  React.useEffect(() => {
    if (!slugTouched && watchedTitle) {
      form.setValue("slug", slugify(watchedTitle));
    }
  }, [watchedTitle, slugTouched, form]);

  // Context cho AI Copilot - đọc giá trị form hiện tại
  function buildAICtx() {
    const v = form.getValues();
    return {
      title: v.title,
      client: v.client,
      location: v.location,
      year: v.year,
      categoryLabel: PROJECT_CATEGORY_LABELS[v.category],
      scale: v.scale,
      existingSummary: v.summary,
    };
  }

  async function onSubmit(values: ProjectInput) {
    const res =
      mode === "create"
        ? await createProject(values)
        : await updateProject(projectId!, values);

    if (!res.ok) {
      if (res.fieldErrors) {
        (Object.entries(res.fieldErrors) as [keyof ProjectInput, string[]][]).forEach(
          ([f, msgs]) => {
            if (msgs?.[0]) form.setError(f, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo dự án thất bại" : "Cập nhật thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: mode === "create" ? "✓ Đã tạo dự án" : "✓ Đã cập nhật dự án",
      description: values.title,
    });
    if (mode === "create" && res.data?.id) {
      router.push(`/admin/projects/${res.data.id}`);
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
          {/* Card 1: Cơ bản */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">1. Thông tin cơ bản</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: Chiếu sáng đô thị thông minh Ninh Thạnh" />
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
                    URL: /projects/<strong>{watchedSlug || "..."}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Tóm tắt</FormLabel>
                    <AIGenerateButton
                      contentType="project-summary"
                      label="tóm tắt"
                      aiEnabled={aiEnabled}
                      getContext={buildAICtx}
                      onAccept={(t) =>
                        form.setValue("summary", t, { shouldDirty: true })
                      }
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                      maxLength={500}
                      placeholder="1-2 câu mô tả, hiển thị ở card dự án trên trang chủ."
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
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <AIGenerateButton
                      contentType="project-description"
                      label="mô tả"
                      aiEnabled={aiEnabled}
                      getContext={buildAICtx}
                      onAccept={(t) =>
                        form.setValue("description", t, { shouldDirty: true })
                      }
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={10}
                      maxLength={20_000}
                      placeholder="Mô tả đầy đủ. Hỗ trợ Markdown: **bold**, *italic*, - bullet, ## heading."
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Markdown → render HTML ở trang chi tiết.{" "}
                    {(field.value ?? "").length.toLocaleString()}/20.000 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Card 2: Thông tin dự án */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">2. Thông tin dự án</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chủ đầu tư</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="VD: UBND Phường Ninh Thạnh"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="VD: Tây Ninh"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm thực hiện</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1900}
                        max={2100}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value),
                          )
                        }
                        placeholder="2026"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Danh mục <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategoryValue[]).map(
                          (key) => (
                            <SelectItem key={key} value={key}>
                              {PROJECT_CATEGORY_LABELS[key]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Quy mô</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="VD: 12 nút giao, 320 tủ điều khiển, 1500 điểm sáng"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Card 3: Hình ảnh + video */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">3. Hình ảnh & Video</h2>
            <ImageUploader name="images" hint="Ảnh dự án — tối đa 30 ảnh, mỗi ảnh ≤ 5MB" />
            <FormField
              control={form.control}
              name="images"
              render={() => <FormMessage />}
            />
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    YouTube hoặc Vimeo embed URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Card 4: Cấu hình */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">4. Cấu hình hiển thị</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Dự án nổi bật</FormLabel>
                      <FormDescription className="text-xs">
                        Hiển thị trên trang chủ.
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
                  <Link href="/admin/projects">
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
                  {mode === "create" ? "Tạo dự án" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

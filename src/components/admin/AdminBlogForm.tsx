"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, Eye, Plus, Trash2 } from "lucide-react";

import {
  blogPostInputSchema,
  type BlogPostInput,
} from "@/lib/validations/admin-blog";
import {
  createBlogPost,
  updateBlogPost,
} from "@/lib/actions/admin-blog";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { RichTextEditor } from "@/components/admin/shared/RichTextEditor";

type Props = {
  mode: "create" | "edit";
  postId?: string;
  defaultValues: BlogPostInput;
};

export function AdminBlogForm({ mode, postId, defaultValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const watchedTitle = form.watch("title");
  const watchedSlug = form.watch("slug");
  const tags = form.watch("tags");
  const isPublished = form.watch("isPublished");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [newTag, setNewTag] = React.useState("");

  React.useEffect(() => {
    if (!slugTouched && watchedTitle) {
      form.setValue("slug", slugify(watchedTitle));
    }
  }, [watchedTitle, slugTouched, form]);

  function addTag() {
    const v = newTag.trim();
    if (!v) return;
    if (tags.some((t) => t.toLowerCase() === v.toLowerCase())) {
      toast({
        title: "Tag trùng",
        description: `"${v}" đã có.`,
        variant: "destructive",
      });
      return;
    }
    if (tags.length >= 20) {
      toast({ title: "Tối đa 20 tag", variant: "destructive" });
      return;
    }
    form.setValue("tags", [...tags, v], { shouldDirty: true });
    setNewTag("");
  }

  function removeTag(t: string) {
    form.setValue(
      "tags",
      tags.filter((x) => x !== t),
      { shouldDirty: true },
    );
  }

  async function onSubmit(values: BlogPostInput) {
    const res =
      mode === "create"
        ? await createBlogPost(values)
        : await updateBlogPost(postId!, values);
    if (!res.ok) {
      if (res.fieldErrors) {
        (Object.entries(res.fieldErrors) as [keyof BlogPostInput, string[]][]).forEach(
          ([f, msgs]) => {
            if (msgs?.[0]) form.setError(f, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo bài viết thất bại" : "Cập nhật thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: mode === "create" ? "✓ Đã tạo bài viết" : "✓ Đã cập nhật bài viết",
      description: values.title,
    });
    if (mode === "create" && res.data?.id) {
      router.push(`/admin/blog/${res.data.id}`);
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
          {/* Card 1: title + slug + excerpt + content */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">1. Nội dung bài viết</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Xu hướng chiếu sáng đô thị 2026"
                    />
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
                    URL: /blog/<strong>{watchedSlug || "..."}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                      maxLength={500}
                      placeholder="1-2 câu mô tả hiển thị ở card và OG."
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nội dung <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Bắt đầu viết bài..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Rich text editor (Tiptap). HTML output sẽ được sanitize trước khi
                    lưu để chống XSS.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Card 2: cover + tags + publish */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">2. Hiển thị</h2>
            <div>
              <FormLabel>Ảnh bìa</FormLabel>
              <div className="mt-2">
                <ImageUploader name="coverImage" mode="single" />
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có tag.</p>
                ) : (
                  tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 pr-1 text-xs">
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="rounded-full hover:bg-destructive/20"
                        aria-label={`Xoá ${t}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Thêm tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Thêm
                </Button>
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={() => <FormMessage />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Đăng bài</FormLabel>
                      <FormDescription className="text-xs">
                        Bật để hiển thị công khai. Tắt = nháp nội bộ.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(c) => {
                          field.onChange(c);
                          // Tự fill publishedAt = now nếu publish lần đầu
                          if (c && !form.getValues("publishedAt")) {
                            form.setValue(
                              "publishedAt",
                              new Date().toISOString().slice(0, 16),
                            );
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian đăng</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={!isPublished}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Để trống = không hiển thị ngày. Auto-fill khi bật &quot;Đăng bài&quot;.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Card 3: SEO */}
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">3. SEO</h2>
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Để trống = dùng tiêu đề"
                      maxLength={160}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {(field.value ?? "").length}/160 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={3}
                      maxLength={320}
                      placeholder="Để trống = dùng tóm tắt"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {(field.value ?? "").length}/320 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Link href="/admin/blog">
                    <X className="h-4 w-4" /> Huỷ
                  </Link>
                </Button>
                {mode === "edit" && (
                  <Button
                    asChild
                    variant="outline"
                    type="button"
                  >
                    <Link
                      href={`/blog/${watchedSlug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye className="h-4 w-4" /> Xem trước
                    </Link>
                  </Button>
                )}
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
                  {mode === "create" ? "Tạo bài viết" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

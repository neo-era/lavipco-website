"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { aboutStorySchema, type ContentValue } from "@/lib/content/schema";
import { updateContentSection } from "@/lib/actions/admin-content";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/admin/shared/ImageUploader";

type AboutStory = ContentValue<"about_story">;

export function AdminStoryForm({ defaultValues }: { defaultValues: AboutStory }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutStory>({
    resolver: zodResolver(aboutStorySchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(values: AboutStory) {
    const res = await updateContentSection("about_story", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Câu chuyện công ty" });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">Câu chuyện công ty</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="paragraph1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đoạn 1</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paragraph2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đoạn 2</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <FormLabel>Ảnh minh hoạ</FormLabel>
              <p className="text-xs text-muted-foreground">
                Bỏ trống → dùng nền gradient + icon mặc định.
              </p>
              <div className="mt-2">
                <ImageUploader name="image" mode="single" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="overlayBadge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhãn overlay</FormLabel>
                    <FormControl><Input {...field} placeholder="VD: Hơn 10 năm kinh nghiệm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overlayCaption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chú thích overlay</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu Câu chuyện
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

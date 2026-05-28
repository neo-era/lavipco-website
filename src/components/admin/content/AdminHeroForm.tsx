"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { homeHeroSchema } from "@/lib/content/schema";
import type { ContentValue } from "@/lib/content/schema";
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

type HomeHero = ContentValue<"home_hero">;

const EMPTY_SLIDE: HomeHero["slides"][number] = {
  image: "",
  badge: "",
  heading: "",
  subHeading: "",
  ctaLabel: "",
  ctaHref: "",
};

export function AdminHeroForm({ defaultValues }: { defaultValues: HomeHero }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<HomeHero>({
    resolver: zodResolver(homeHeroSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "slides",
  });

  async function onSubmit(values: HomeHero) {
    const res = await updateContentSection("home_hero", values);
    if (!res.ok) {
      toast({
        title: "Lưu thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✓ Đã lưu Hero trang chủ" });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Hero carousel</h2>
              <p className="text-xs text-muted-foreground">
                Tối đa 6 slide. Bỏ trống ảnh → dùng nền gradient mặc định.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...EMPTY_SLIDE })}
              disabled={fields.length >= 6}
            >
              <Plus className="h-4 w-4" /> Thêm slide
            </Button>
          </div>

          {fields.map((f, idx) => (
            <Card key={f.id} className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-primary">
                  Slide {idx + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label="Lên"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === fields.length - 1}
                    aria-label="Xuống"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => remove(idx)}
                    disabled={fields.length <= 1}
                    aria-label="Xoá slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <FormLabel>Ảnh nền</FormLabel>
                <div className="mt-2">
                  <ImageUploader name={`slides.${idx}.image`} mode="single" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`slides.${idx}.badge`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: Smart City" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`slides.${idx}.heading`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tiêu đề <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tiêu đề lớn của slide" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`slides.${idx}.subHeading`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Mô tả ngắn dưới tiêu đề." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`slides.${idx}.ctaLabel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nút CTA</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: Khám phá giải pháp" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`slides.${idx}.ctaHref`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link CTA</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: /services hoặc /contact" className="font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu Hero
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

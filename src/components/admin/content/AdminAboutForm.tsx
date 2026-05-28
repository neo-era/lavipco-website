"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

import { homeAboutSchema, type ContentValue } from "@/lib/content/schema";
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

type HomeAbout = ContentValue<"home_about">;

export function AdminAboutForm({ defaultValues }: { defaultValues: HomeAbout }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<HomeAbout>({
    resolver: zodResolver(homeAboutSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stats",
  });

  async function onSubmit(values: HomeAbout) {
    const res = await updateContentSection("home_about", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Giới thiệu tóm tắt" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-bold">Giới thiệu tóm tắt</h2>
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
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="ctaLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nút CTA</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ctaHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link CTA</FormLabel>
                  <FormControl><Input {...field} className="font-mono text-sm" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Số liệu thống kê</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "", label: "" })}
              disabled={fields.length >= 8}
            >
              <Plus className="h-4 w-4" /> Thêm
            </Button>
          </div>
          {fields.map((f, idx) => (
            <div key={f.id} className="grid grid-cols-[1fr_2fr_40px] items-start gap-2">
              <FormField
                control={form.control}
                name={`stats.${idx}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl><Input {...field} placeholder="VD: 10+" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`stats.${idx}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl><Input {...field} placeholder="VD: Năm kinh nghiệm" /></FormControl>
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
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu Giới thiệu
          </Button>
        </div>
      </form>
    </Form>
  );
}

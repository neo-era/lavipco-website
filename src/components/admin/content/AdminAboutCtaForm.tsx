"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { aboutCtaSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutCta = ContentValue<"about_cta">;

export function AdminAboutCtaForm({ defaultValues }: { defaultValues: AboutCta }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutCta>({
    resolver: zodResolver(aboutCtaSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(values: AboutCta) {
    const res = await updateContentSection("about_cta", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu CTA giới thiệu" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-base font-bold">Kêu gọi hành động (CTA)</h2>
            <p className="text-xs text-muted-foreground">
              Hotline/email hiển thị tự lấy từ mục Cấu hình → Liên hệ.
            </p>
          </div>
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
          <FormField
            control={form.control}
            name="paragraph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="button1Label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nút 1 — chữ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button1Href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nút 1 — link</FormLabel>
                  <FormControl><Input {...field} className="font-mono text-sm" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button2Label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nút 2 — chữ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button2Href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nút 2 — link</FormLabel>
                  <FormControl><Input {...field} className="font-mono text-sm" /></FormControl>
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
            Lưu CTA
          </Button>
        </div>
      </form>
    </Form>
  );
}

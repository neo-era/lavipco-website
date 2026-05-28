"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

import { homeCtaSchema, type ContentValue } from "@/lib/content/schema";
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

type HomeCta = ContentValue<"home_cta">;

export function AdminCtaForm({ defaultValues }: { defaultValues: HomeCta }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<HomeCta>({
    resolver: zodResolver(homeCtaSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items" as never,
  });

  async function onSubmit(values: HomeCta) {
    const res = await updateContentSection("home_cta", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu CTA trang chủ" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-bold">Kêu gọi hành động (CTA)</h2>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel>Danh sách điểm nổi bật</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append("" as never)}
                disabled={fields.length >= 8}
              >
                <Plus className="h-4 w-4" /> Thêm
              </Button>
            </div>
            {fields.map((f, idx) => (
              <div key={f.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`items.${idx}` as `items.${number}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input {...field} placeholder="VD: Khảo sát miễn phí" /></FormControl>
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
        </Card>

        <Card className="grid gap-4 p-5 md:grid-cols-2">
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

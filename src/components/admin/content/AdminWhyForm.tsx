"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

import { homeWhySchema, type ContentValue } from "@/lib/content/schema";
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

type HomeWhy = ContentValue<"home_why">;

export function AdminWhyForm({ defaultValues }: { defaultValues: HomeWhy }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<HomeWhy>({
    resolver: zodResolver(homeWhySchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reasons",
  });

  async function onSubmit(values: HomeWhy) {
    const res = await updateContentSection("home_why", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Vì sao chọn chúng tôi" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-base font-bold">Vì sao chọn chúng tôi</h2>
            <p className="text-xs text-muted-foreground">
              Icon cố định theo thứ tự thẻ (không sửa trong admin).
            </p>
          </div>
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
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Các lý do</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", description: "" })}
              disabled={fields.length >= 8}
            >
              <Plus className="h-4 w-4" /> Thêm
            </Button>
          </div>
          {fields.map((f, idx) => (
            <div key={f.id} className="space-y-2 rounded-md border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-primary">
                  Lý do {idx + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => remove(idx)}
                  aria-label="Xoá"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name={`reasons.${idx}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl><Input {...field} placeholder="Tiêu đề lý do" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`reasons.${idx}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl><Textarea {...field} rows={2} placeholder="Mô tả" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            Lưu
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { aboutTimelineSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutTimeline = ContentValue<"about_timeline">;

export function AdminTimelineForm({
  defaultValues,
}: {
  defaultValues: AboutTimeline;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutTimeline>({
    resolver: zodResolver(aboutTimelineSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  async function onSubmit(values: AboutTimeline) {
    const res = await updateContentSection("about_timeline", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Lịch sử phát triển" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-bold">Lịch sử phát triển</h2>
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
            <h3 className="text-sm font-semibold">Cột mốc</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ year: "", title: "", description: "" })}
              disabled={fields.length >= 12}
            >
              <Plus className="h-4 w-4" /> Thêm
            </Button>
          </div>
          {fields.map((f, idx) => (
            <div key={f.id} className="space-y-2 rounded-md border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-primary">
                  Mốc {idx + 1}
                </span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label="Lên">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(idx, idx + 1)} disabled={idx === fields.length - 1} aria-label="Xuống">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(idx)} aria-label="Xoá">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-[120px_1fr]">
                <FormField
                  control={form.control}
                  name={`milestones.${idx}.year`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} placeholder="Năm" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`milestones.${idx}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input {...field} placeholder="Tiêu đề mốc" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`milestones.${idx}.description`}
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

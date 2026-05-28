"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { aboutLeadershipSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutLeadership = ContentValue<"about_leadership">;

export function AdminLeadershipForm({
  defaultValues,
}: {
  defaultValues: AboutLeadership;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutLeadership>({
    resolver: zodResolver(aboutLeadershipSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "leaders",
  });

  async function onSubmit(values: AboutLeadership) {
    const res = await updateContentSection("about_leadership", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Đội ngũ lãnh đạo" });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="space-y-4 p-5">
            <h2 className="text-base font-bold">Đội ngũ lãnh đạo</h2>
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
              <h3 className="text-sm font-semibold">Thành viên</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", role: "", bio: "", photo: "" })}
                disabled={fields.length >= 8}
              >
                <Plus className="h-4 w-4" /> Thêm
              </Button>
            </div>
            {fields.map((f, idx) => (
              <div key={f.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-primary">
                    Người {idx + 1}
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
                <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                  <div>
                    <FormLabel className="text-xs">Ảnh</FormLabel>
                    <div className="mt-1">
                      <ImageUploader name={`leaders.${idx}.photo`} mode="single" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`leaders.${idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Họ và tên" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`leaders.${idx}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Chức vụ" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`leaders.${idx}.bio`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Textarea {...field} rows={2} placeholder="Giới thiệu ngắn" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
    </FormProvider>
  );
}

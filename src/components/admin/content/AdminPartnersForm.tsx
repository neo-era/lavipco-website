"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

import { aboutPartnersSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutPartners = ContentValue<"about_partners">;

export function AdminPartnersForm({
  defaultValues,
}: {
  defaultValues: AboutPartners;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutPartners>({
    resolver: zodResolver(aboutPartnersSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "partners",
  });

  async function onSubmit(values: AboutPartners) {
    const res = await updateContentSection("about_partners", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Đối tác" });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-base font-bold">Đối tác & khách hàng</h2>
              <p className="text-xs text-muted-foreground">
                Bỏ trống logo → hiển thị tên dạng chữ.
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
          </Card>

          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Danh sách đối tác</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", logo: "" })}
                disabled={fields.length >= 20}
              >
                <Plus className="h-4 w-4" /> Thêm
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((f, idx) => (
                <div key={f.id} className="space-y-2 rounded-md border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-primary">
                      Đối tác {idx + 1}
                    </span>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(idx)} aria-label="Xoá">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`partners.${idx}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl><Input {...field} placeholder="Tên đối tác" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel className="text-xs">Logo</FormLabel>
                    <div className="mt-1">
                      <ImageUploader name={`partners.${idx}.logo`} mode="single" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

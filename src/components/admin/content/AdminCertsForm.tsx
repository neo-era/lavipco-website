"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

import { aboutCertsSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutCerts = ContentValue<"about_certs">;

export function AdminCertsForm({ defaultValues }: { defaultValues: AboutCerts }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutCerts>({
    resolver: zodResolver(aboutCertsSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certs",
  });

  async function onSubmit(values: AboutCerts) {
    const res = await updateContentSection("about_certs", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Chứng nhận" });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-base font-bold">Chứng nhận & tiêu chuẩn</h2>
              <p className="text-xs text-muted-foreground">
                Bỏ trống logo → dùng icon mặc định.
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
              <h3 className="text-sm font-semibold">Danh sách chứng nhận</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", issuer: "", logo: "" })}
                disabled={fields.length >= 12}
              >
                <Plus className="h-4 w-4" /> Thêm
              </Button>
            </div>
            {fields.map((f, idx) => (
              <div key={f.id} className="space-y-3 rounded-md border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-primary">
                    Chứng nhận {idx + 1}
                  </span>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(idx)} aria-label="Xoá">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                  <div>
                    <FormLabel className="text-xs">Logo</FormLabel>
                    <div className="mt-1">
                      <ImageUploader name={`certs.${idx}.logo`} mode="single" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`certs.${idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Tên chứng nhận" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certs.${idx}.issuer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input {...field} placeholder="Lĩnh vực / đơn vị cấp" /></FormControl>
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

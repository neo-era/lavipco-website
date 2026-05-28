"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { aboutHeroSchema, type ContentValue } from "@/lib/content/schema";
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

type AboutHero = ContentValue<"about_hero">;

export function AdminAboutHeroForm({ defaultValues }: { defaultValues: AboutHero }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AboutHero>({
    resolver: zodResolver(aboutHeroSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(values: AboutHero) {
    const res = await updateContentSection("about_hero", values);
    if (!res.ok) {
      toast({ title: "Lưu thất bại", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Đã lưu Hero giới thiệu" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-bold">Hero giới thiệu</h2>
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
          <FormField
            control={form.control}
            name="paragraph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea {...field} rows={3} /></FormControl>
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
            Lưu Hero
          </Button>
        </div>
      </form>
    </Form>
  );
}

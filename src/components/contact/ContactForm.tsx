"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";

import {
  contactSchema,
  type ContactInput,
  CONTACT_SUBJECTS,
} from "@/lib/validations/contact";
import { submitContact } from "@/lib/actions/contact";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULTS: ContactInput = {
  name: "",
  email: "",
  phone: "",
  subject: "Tư vấn sản phẩm",
  message: "",
};

export function ContactForm() {
  const { toast } = useToast();

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULTS,
  });

  async function onSubmit(values: ContactInput) {
    const result = await submitContact(values);

    if (result.ok) {
      toast({
        title: "✓ Đã gửi liên hệ",
        description: "Đội ngũ LAVIPCO sẽ phản hồi trong vòng 24 giờ.",
      });
      form.reset(DEFAULTS);
      return;
    }

    // Server trả lỗi field → setError tương ứng
    if (result.fieldErrors) {
      (Object.entries(result.fieldErrors) as [keyof ContactInput, string[]][]).forEach(
        ([field, msgs]) => {
          if (msgs[0]) form.setError(field, { message: msgs[0] });
        },
      );
      return;
    }

    // Lỗi chung (rate limit / DB error)
    toast({
      title: "Không gửi được",
      description: result.error || "Lỗi không xác định, thử lại sau.",
      variant: "destructive",
    });
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Gửi tin nhắn</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Các trường có dấu (*) là bắt buộc.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Họ và tên <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số điện thoại <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="0912 345 678"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ban@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tiêu đề <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tiêu đề liên hệ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTACT_SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nội dung <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Mô tả nhu cầu hoặc câu hỏi của bạn..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            variant="brand"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {form.formState.isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Bằng việc gửi yêu cầu, bạn đồng ý cho LAVIPCO sử dụng thông tin để liên
            hệ tư vấn theo Chính sách bảo mật.
          </p>
        </form>
      </Form>
    </div>
  );
}

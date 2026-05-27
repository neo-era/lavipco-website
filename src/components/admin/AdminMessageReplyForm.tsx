"use client";

/**
 * Form trả lời tin nhắn liên hệ. Send email qua Resend + lưu ContactReply.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Save } from "lucide-react";

import {
  replyMessageSchema,
  type ReplyMessageInput,
} from "@/lib/validations/admin-message";
import { replyToMessage } from "@/lib/actions/admin-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type Props = {
  messageId: string;
  customerName: string;
};

export function AdminMessageReplyForm({ messageId, customerName }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ReplyMessageInput>({
    resolver: zodResolver(replyMessageSchema),
    defaultValues: {
      body: `Xin chào ${customerName},\n\nCảm ơn anh/chị đã liên hệ. \n\n[Nội dung phản hồi]\n\nTrân trọng,\nLAVIPCO`,
      sendEmail: true,
    },
  });

  async function onSubmit(values: ReplyMessageInput) {
    const res = await replyToMessage(messageId, values);
    if (!res.ok) {
      if (res.fieldErrors) {
        (Object.entries(res.fieldErrors) as [keyof ReplyMessageInput, string[]][]).forEach(
          ([field, msgs]) => {
            if (msgs?.[0]) form.setError(field, { message: msgs[0] });
          },
        );
      }
      toast({
        title: "Gửi trả lời thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "✓ Đã lưu trả lời",
      description: res.data?.emailSent
        ? "Email đã được gửi tới khách."
        : "Đã lưu vào lịch sử (email không gửi do chưa cấu hình hoặc bị tắt).",
    });
    form.reset({ body: "", sendEmail: true });
    router.refresh();
  }

  const sendEmail = form.watch("sendEmail");

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung trả lời</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={8}
                    placeholder="Nhập nội dung trả lời..."
                    maxLength={10_000}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {(field.value ?? "").length}/10.000 ký tự
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sendEmail"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div>
                  <FormLabel className="text-sm">Gửi qua email</FormLabel>
                  <FormDescription className="text-xs">
                    Tắt để chỉ lưu nội dung phản hồi vào nhật ký (không gửi email cho khách).
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="brand"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendEmail ? (
                <Send className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {sendEmail ? "Gửi trả lời" : "Lưu nội bộ"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

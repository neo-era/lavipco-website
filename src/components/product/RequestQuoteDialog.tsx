"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";

import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/lib/validations/quote";
import { submitQuote } from "@/lib/actions/quote";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  productSlug: string;
  productName: string;
  children: React.ReactNode;
};

/**
 * Dialog "Yêu cầu báo giá" trên trang chi tiết sản phẩm.
 * Pre-fill `productSlug` hidden; subject auto-build "Báo giá: <productName>" ở server.
 */
export function RequestQuoteDialog({ productSlug, productName, children }: Props) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const defaults: QuoteRequestInput = {
    name: "",
    email: "",
    phone: "",
    message: `Tôi quan tâm sản phẩm "${productName}" và muốn nhận báo giá chi tiết. Vui lòng liên hệ tư vấn.`,
    productSlug,
  };

  const form = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: QuoteRequestInput) {
    const result = await submitQuote(values);

    if (result.ok) {
      toast({
        title: "✓ Đã gửi yêu cầu báo giá",
        description: "Đội ngũ LAVIPCO sẽ liên hệ với bạn trong vòng 24 giờ.",
      });
      form.reset(defaults);
      setOpen(false);
      return;
    }

    if (result.fieldErrors) {
      (
        Object.entries(result.fieldErrors) as [keyof QuoteRequestInput, string[]][]
      ).forEach(([field, msgs]) => {
        if (msgs[0]) form.setError(field, { message: msgs[0] });
      });
      return;
    }

    toast({
      title: "Không gửi được",
      description: result.error || "Lỗi không xác định, thử lại sau.",
      variant: "destructive",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yêu cầu báo giá</DialogTitle>
          <DialogDescription>
            Sản phẩm: <span className="font-medium text-foreground">{productName}</span>
            <br />
            Đội ngũ LAVIPCO sẽ liên hệ trong vòng 24 giờ.
          </DialogDescription>
        </DialogHeader>

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
                      <Input autoComplete="name" {...field} />
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
                      <Input type="tel" autoComplete="tel" {...field} />
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
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
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
                    Nội dung yêu cầu <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
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
              {form.formState.isSubmitting ? "Đang gửi..." : "Gửi yêu cầu báo giá"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

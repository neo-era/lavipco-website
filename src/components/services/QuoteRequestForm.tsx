"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Send, Phone } from "lucide-react";

import { requestQuote, type QuoteFormState } from "@/lib/actions/quote";
import { SITE_CONFIG } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";

const initialState: QuoteFormState = {};

export function QuoteRequestForm({
  serviceSlug,
  serviceTitle,
}: {
  serviceSlug: string;
  serviceTitle: string;
}) {
  const [state, formAction] = useFormState(requestQuote, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Hiển thị toast khi submit thành công + reset form
  React.useEffect(() => {
    if (state.ok && state.submittedAt) {
      toast({
        title: "✓ Đã gửi yêu cầu báo giá",
        description: "Đội ngũ LAVIPCO sẽ liên hệ với bạn trong vòng 24 giờ.",
      });
      formRef.current?.reset();
    }
  }, [state.ok, state.submittedAt, toast]);

  return (
    <section id="quote" className="bg-brand-dark py-16 text-white md:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left: title + contact */}
          <div className="space-y-5 lg:col-span-2">
            <Badge variant="accent" className="rounded-full">
              Yêu cầu báo giá
            </Badge>
            <h2 className="text-balance text-3xl font-bold md:text-4xl">
              Cần báo giá chi tiết cho dịch vụ này?
            </h2>
            <p className="text-white/85">
              Để lại thông tin, đội ngũ kỹ thuật LAVIPCO sẽ liên hệ tư vấn và gửi báo
              giá trong vòng 24 giờ.
            </p>

            <div className="space-y-3 pt-2">
              {SITE_CONFIG.hotline && (
                <a
                  href={`tel:${SITE_CONFIG.hotline.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-4 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/70">Gọi nhanh</div>
                    <div className="font-semibold">{SITE_CONFIG.hotline}</div>
                  </div>
                </a>
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Hoặc liên hệ qua trang Liên hệ</Link>
              </Button>
            </div>
          </div>

          {/* Right: form */}
          <form
            ref={formRef}
            action={formAction}
            className="space-y-4 rounded-xl bg-background p-6 text-foreground shadow-lg sm:p-8 lg:col-span-3"
          >
            <input type="hidden" name="serviceSlug" value={serviceSlug} />

            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Chủ đề:{" "}
              <span className="font-medium text-foreground">Báo giá: {serviceTitle}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quote-name">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quote-name"
                  name="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  required
                  aria-invalid={!!state.fieldErrors?.name}
                />
                {state.fieldErrors?.name && (
                  <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-phone">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quote-phone"
                  name="phone"
                  type="tel"
                  placeholder="0912 345 678"
                  autoComplete="tel"
                  required
                  aria-invalid={!!state.fieldErrors?.phone}
                />
                {state.fieldErrors?.phone && (
                  <p className="text-xs text-destructive">{state.fieldErrors.phone[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quote-email"
                name="email"
                type="email"
                placeholder="ban@email.com"
                autoComplete="email"
                required
                aria-invalid={!!state.fieldErrors?.email}
              />
              {state.fieldErrors?.email && (
                <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote-message">
                Nội dung yêu cầu <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="quote-message"
                name="message"
                rows={5}
                placeholder="Mô tả ngắn về dự án, quy mô và mong muốn của bạn..."
                required
                aria-invalid={!!state.fieldErrors?.message}
              />
              {state.fieldErrors?.message && (
                <p className="text-xs text-destructive">{state.fieldErrors.message[0]}</p>
              )}
            </div>

            {state.error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <SubmitButton />
            <p className="text-xs text-muted-foreground">
              Bằng việc gửi yêu cầu, bạn đồng ý cho LAVIPCO sử dụng thông tin để liên
              hệ tư vấn theo Chính sách bảo mật.
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="brand" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {pending ? "Đang gửi..." : "Gửi yêu cầu báo giá"}
    </Button>
  );
}

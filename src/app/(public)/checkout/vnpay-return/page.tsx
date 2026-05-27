import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, RefreshCw, MessageCircle } from "lucide-react";

import { db } from "@/lib/db";
import { verifyReturnUrl, getResponseMessage } from "@/lib/payment/vnpay";
import { formatCurrency } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kết quả thanh toán VNPay",
  robots: { index: false, follow: false },
};

// VNPay redirect về với nhiều query params → phải dynamic
export const dynamic = "force-dynamic";

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Convert searchParams object → flat string record
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") query[k] = v;
  }

  // Verify chữ ký + parse
  const result = verifyReturnUrl(query);

  // Hash invalid - khả năng bị giả mạo
  if (!result.isValid) {
    return (
      <FailView
        title="Chữ ký không hợp lệ"
        description="Phản hồi từ cổng thanh toán không hợp lệ. Vui lòng liên hệ hỗ trợ nếu bạn vừa thanh toán."
        orderId={result.orderId}
      />
    );
  }

  // Hash valid - update Order theo response code
  const orderCode = result.orderId;
  if (!orderCode) {
    return (
      <FailView
        title="Không nhận diện được đơn hàng"
        description="Phản hồi từ VNPay không kèm mã đơn hàng."
        orderId={null}
      />
    );
  }

  const order = await db.order.findUnique({ where: { code: orderCode } });
  if (!order) {
    return (
      <FailView
        title="Không tìm thấy đơn hàng"
        description={`Đơn ${orderCode} không tồn tại trong hệ thống.`}
        orderId={orderCode}
      />
    );
  }

  if (result.isSuccess) {
    // Idempotent update - chỉ update nếu chưa PAID (IPN có thể đã update trước)
    if (order.paymentStatus !== "PAID") {
      await db.order.update({
        where: { code: orderCode },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
        },
      });
    }
    // Redirect về success page chính - tránh duplicate UI
    redirect(`/checkout/success?code=${orderCode}`);
  }

  // Hash valid nhưng thanh toán thất bại - update FAILED nếu chưa
  if (order.paymentStatus === "PENDING") {
    await db.order.update({
      where: { code: orderCode },
      data: { paymentStatus: "FAILED" },
    });
  }

  return (
    <FailView
      title="Thanh toán không thành công"
      description={getResponseMessage(result.responseCode)}
      orderId={orderCode}
      amount={result.amount}
      responseCode={result.responseCode}
    />
  );
}

function FailView({
  title,
  description,
  orderId,
  amount,
  responseCode,
}: {
  title: string;
  description: string;
  orderId: string | null;
  amount?: number | null;
  responseCode?: string | null;
}) {
  return (
    <section className="py-12 md:py-16">
      <Container className="max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-balance text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8 space-y-3 rounded-xl border bg-card p-6">
          {orderId && (
            <Row
              label="Mã đơn hàng"
              value={<span className="font-mono font-bold text-brand-primary">{orderId}</span>}
            />
          )}
          {amount !== undefined && amount !== null && (
            <Row label="Số tiền" value={formatCurrency(amount)} />
          )}
          {responseCode && (
            <Row
              label="Mã lỗi VNPay"
              value={
                <Badge variant="destructive" className="font-mono">
                  {responseCode}
                </Badge>
              }
            />
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {orderId && (
            <Button asChild size="lg" variant="brand">
              <Link href={`/checkout/success?code=${orderId}`}>
                <RefreshCw className="h-4 w-4" />
                Xem chi tiết đơn hàng
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">
              <MessageCircle className="h-4 w-4" />
              Liên hệ hỗ trợ
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

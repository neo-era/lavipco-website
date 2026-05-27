"use client";

/**
 * Card hành động chính cho admin trên trang chi tiết đơn:
 *  - Đổi trạng thái đơn
 *  - Đổi trạng thái thanh toán (+ transactionId)
 *  - Cập nhật vận chuyển (provider + trackingCode)
 *  - Huỷ đơn (dialog yêu cầu lý do)
 *  - Hoàn tiền (dialog xác nhận + amount, ẩn nếu chưa PAID hoặc đã REFUNDED)
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  XCircle,
  RotateCcw,
  Settings2,
  Truck,
  CreditCard,
} from "lucide-react";
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingStatus,
} from "@prisma/client";

import {
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingInfo,
  cancelOrder,
  refundOrder,
} from "@/lib/actions/admin-orders";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  paymentMethod: PaymentMethod;
  total: number;
  paymentTransactionId: string | null;
  shippingProvider: string | null;
  trackingCode: string | null;
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
];
const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PAID", "FAILED"];
const SHIPPING_STATUS_OPTIONS: ShippingStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
];
const SHIPPING_PROVIDERS = ["GHN", "GHTK", "Viettel Post", "J&T", "Khác"];

export function OrderActionsCard({
  orderId,
  orderCode,
  orderStatus,
  paymentStatus,
  shippingStatus,
  paymentMethod,
  total,
  paymentTransactionId,
  shippingProvider,
  trackingCode,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();

  // State cho từng form section
  const [newOrderStatus, setNewOrderStatus] = React.useState<OrderStatus>(orderStatus);
  const [orderNote, setOrderNote] = React.useState("");

  const [newPaymentStatus, setNewPaymentStatus] =
    React.useState<PaymentStatus>(paymentStatus);
  const [txnId, setTxnId] = React.useState(paymentTransactionId ?? "");

  const [provider, setProvider] = React.useState(shippingProvider ?? "GHN");
  const [tracking, setTracking] = React.useState(trackingCode ?? "");
  const [newShipStatus, setNewShipStatus] =
    React.useState<ShippingStatus>(shippingStatus);

  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const [refundOpen, setRefundOpen] = React.useState(false);
  const [refundAmount, setRefundAmount] = React.useState(total);
  const [refundReason, setRefundReason] = React.useState("");

  // ====================================================================
  const isCancelled = orderStatus === "CANCELLED";
  const isCompleted = orderStatus === "COMPLETED";
  const canCancel = !isCancelled && !isCompleted;
  const canRefund =
    paymentStatus === "PAID" && !isCancelled; // mark REFUNDED OK kể cả đã cancel? — chặn để rõ ràng

  function handleOrderStatusSave() {
    if (newOrderStatus === orderStatus) {
      toast({ title: "Chưa thay đổi" });
      return;
    }
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, {
        status: newOrderStatus,
        note: orderNote || undefined,
      });
      if (res.ok) {
        toast({
          title: "✓ Đã đổi trạng thái",
          description: `${orderCode} → ${ORDER_STATUS[newOrderStatus].label}`,
        });
        setOrderNote("");
        router.refresh();
      } else {
        toast({
          title: "Lỗi đổi trạng thái",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handlePaymentStatusSave() {
    startTransition(async () => {
      const res = await updatePaymentStatus(orderId, {
        status: newPaymentStatus,
        transactionId: txnId || undefined,
      });
      if (res.ok) {
        toast({
          title: "✓ Đã cập nhật thanh toán",
          description: `${orderCode} → ${PAYMENT_STATUS[newPaymentStatus].label}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Lỗi cập nhật thanh toán",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handleShippingSave() {
    if (!tracking.trim()) {
      toast({
        title: "Thiếu mã vận đơn",
        description: "Vui lòng nhập mã vận đơn trước khi lưu.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const res = await updateShippingInfo(orderId, {
        provider,
        trackingCode: tracking.trim(),
        shippingStatus: newShipStatus !== shippingStatus ? newShipStatus : undefined,
      });
      if (res.ok) {
        toast({
          title: "✓ Đã cập nhật vận chuyển",
          description: `${provider} ${tracking}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Lỗi cập nhật vận chuyển",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelOrder(orderId, { reason: cancelReason });
      if (res.ok) {
        toast({
          title: "✓ Đã huỷ đơn",
          description: `${orderCode} - tồn kho đã được hoàn lại.`,
        });
        setCancelOpen(false);
        setCancelReason("");
        router.refresh();
      } else {
        toast({
          title: "Huỷ đơn thất bại",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handleRefund() {
    startTransition(async () => {
      const res = await refundOrder(orderId, {
        amount: refundAmount,
        reason: refundReason || undefined,
      });
      if (res.ok) {
        toast({
          title: "✓ Đã hoàn tiền",
          description: `${formatCurrency(refundAmount)} qua ${res.data?.method}`,
        });
        setRefundOpen(false);
        setRefundReason("");
        router.refresh();
      } else {
        toast({
          title: "Hoàn tiền thất bại",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Settings2 className="h-4 w-4 text-brand-primary" />
        Hành động
      </h3>

      {/* Order status */}
      <div className="space-y-2">
        <Label className="text-xs">Trạng thái đơn</Label>
        <Select
          value={newOrderStatus}
          onValueChange={(v) => setNewOrderStatus(v as OrderStatus)}
          disabled={isCancelled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          rows={2}
          placeholder="Ghi chú gửi kèm cho khách (optional)"
          className="text-sm"
          disabled={isCancelled}
        />
        <Button
          size="sm"
          variant="brand"
          className="w-full"
          onClick={handleOrderStatusSave}
          disabled={pending || isCancelled || newOrderStatus === orderStatus}
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Lưu trạng thái
        </Button>
      </div>

      <hr />

      {/* Payment status */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1 text-xs">
          <CreditCard className="h-3 w-3" />
          Trạng thái thanh toán
        </Label>
        <Select
          value={newPaymentStatus}
          onValueChange={(v) => setNewPaymentStatus(v as PaymentStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {PAYMENT_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(paymentMethod === "VNPAY" ||
          paymentMethod === "MOMO" ||
          paymentMethod === "BANK_TRANSFER") && (
          <Input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Mã giao dịch (VNPay TxnNo / ref ngân hàng)"
            className="font-mono text-xs"
          />
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handlePaymentStatusSave}
          disabled={pending}
        >
          <Save className="h-3 w-3" />
          Lưu thanh toán
        </Button>
      </div>

      <hr />

      {/* Shipping */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1 text-xs">
          <Truck className="h-3 w-3" />
          Vận chuyển
        </Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Đơn vị vận chuyển" />
          </SelectTrigger>
          <SelectContent>
            {SHIPPING_PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Mã vận đơn"
          className="font-mono text-sm"
        />
        <Select
          value={newShipStatus}
          onValueChange={(v) => setNewShipStatus(v as ShippingStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHIPPING_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleShippingSave}
          disabled={pending}
        >
          <Save className="h-3 w-3" />
          Lưu vận chuyển
        </Button>
      </div>

      <hr />

      {/* Danger zone */}
      <div className="space-y-2">
        {canCancel && (
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => setCancelOpen(true)}
            disabled={pending}
          >
            <XCircle className="h-3 w-3" />
            Huỷ đơn (hoàn kho)
          </Button>
        )}
        {canRefund && (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setRefundOpen(true)}
            disabled={pending}
          >
            <RotateCcw className="h-3 w-3" />
            Hoàn tiền
          </Button>
        )}
        {!canCancel && !canRefund && (
          <p className="text-center text-[11px] text-muted-foreground">
            Đơn không thể huỷ hoặc hoàn tiền ở trạng thái hiện tại.
          </p>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Huỷ đơn {orderCode}?</DialogTitle>
            <DialogDescription>
              Đơn sẽ chuyển sang trạng thái <strong>CANCELLED</strong>. Tồn kho của tất
              cả sản phẩm trong đơn sẽ được hoàn lại. Khách sẽ nhận email thông báo.
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>
              Lý do huỷ <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="VD: Khách yêu cầu huỷ, hết hàng, sai địa chỉ..."
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCancelOpen(false)}
              disabled={pending}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={pending || cancelReason.trim().length < 5}
            >
              {pending && <Loader2 className="h-3 w-3 animate-spin" />}
              Xác nhận huỷ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund dialog */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tiền đơn {orderCode}?</DialogTitle>
            <DialogDescription>
              {paymentMethod === "VNPAY"
                ? "Hệ thống sẽ gọi VNPay Refund API. Đảm bảo đơn có mã giao dịch (vnp_TransactionNo) hợp lệ. Lưu ý sandbox có thể từ chối nếu giao dịch quá cũ."
                : "Đơn sẽ được đánh dấu REFUNDED, không gọi API thanh toán. Hãy chuyển tiền cho khách qua dashboard / ngân hàng và ghi lại lý do."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Số tiền hoàn (VND)</Label>
              <Input
                type="number"
                min={1}
                max={total}
                value={refundAmount}
                onChange={(e) =>
                  setRefundAmount(Math.max(0, Number(e.target.value) || 0))
                }
              />
              <p className="text-[10px] text-muted-foreground">
                Tối đa: {formatCurrency(total)} (tổng đơn)
              </p>
            </div>
            <div className="space-y-1">
              <Label>Lý do (optional)</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={2}
                placeholder="VD: Khách trả hàng, sai sản phẩm..."
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRefundOpen(false)}
              disabled={pending}
            >
              Đóng
            </Button>
            <Button
              variant="brand"
              onClick={handleRefund}
              disabled={pending || refundAmount <= 0 || refundAmount > total}
            >
              {pending && <Loader2 className="h-3 w-3 animate-spin" />}
              Xác nhận hoàn tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

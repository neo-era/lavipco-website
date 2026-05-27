"use client";

/**
 * Editor ghi chú nội bộ admin.
 * Auto debounce 2s sau khi gõ → tự save. Hiển thị "Đã lưu" / "Đang lưu".
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, StickyNote } from "lucide-react";

import { addInternalNote } from "@/lib/actions/admin-orders";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  initial: string;
};

export function InternalNoteEditor({ orderId, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);

  const isDirty = value !== initial && value.trim() !== initial.trim();

  function save() {
    if (!isDirty) return;
    startTransition(async () => {
      const res = await addInternalNote(orderId, { note: value });
      if (res.ok) {
        setSavedAt(new Date());
        router.refresh();
      } else {
        toast({
          title: "Lưu ghi chú thất bại",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-2 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <StickyNote className="h-4 w-4 text-brand-primary" />
          Ghi chú nội bộ
        </h3>
        <span className="text-[10px] text-muted-foreground">
          chỉ admin/staff xem
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Ghi chú riêng dành cho team xử lý đơn (vd: khách hẹn giao chiều, đợi xác nhận chuyển khoản...)"
        maxLength={2000}
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {value.length}/2000 ký tự
          {savedAt && !isDirty && (
            <span className="ml-2 inline-flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              Đã lưu lúc {savedAt.toLocaleTimeString("vi-VN")}
            </span>
          )}
        </p>
        <Button
          size="sm"
          variant={isDirty ? "brand" : "ghost"}
          disabled={!isDirty || pending}
          onClick={save}
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          Lưu ghi chú
        </Button>
      </div>
    </div>
  );
}

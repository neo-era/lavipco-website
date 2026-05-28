"use client";

/**
 * Nút "✨ AI" sinh nội dung qua Claude + preview modal cho admin duyệt.
 *
 * Flow:
 *  1. Bấm ✨ → gọi generateContent(contextType, context) → loading
 *  2. Mở dialog hiển thị text AI sinh (editable textarea)
 *  3. Admin đọc/sửa → "Dùng nội dung" → onAccept(text) → đóng
 *     hoặc "Tạo lại" → regenerate
 *
 * Tự ẩn khi aiEnabled=false (thiếu ANTHROPIC_API_KEY).
 */
import * as React from "react";
import { Sparkles, Loader2, RefreshCw, Check } from "lucide-react";

import {
  generateContent,
  type GenerateContentResult,
} from "@/lib/actions/ai-content";
import type { AIContentType, AIGenerateContext } from "@/lib/ai/prompts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  /** Loại content - khớp AIContentType. */
  contentType: AIContentType;
  /** Nhãn hiển thị (vd "mô tả sản phẩm"). */
  label: string;
  /** Hàm đọc context data từ form hiện tại (gọi lúc bấm nút). */
  getContext: () => AIGenerateContext["data"];
  /** Callback khi admin chấp nhận nội dung. */
  onAccept: (text: string) => void;
  /** AI có bật không (từ env). Tự ẩn nếu false. */
  aiEnabled: boolean;
  /** Kích thước nút. */
  size?: "sm" | "default";
};

export function AIGenerateButton({
  contentType,
  label,
  getContext,
  onAccept,
  aiEnabled,
  size = "sm",
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [text, setText] = React.useState("");

  if (!aiEnabled) return null;

  async function runGenerate() {
    setLoading(true);
    try {
      const ctx = {
        type: contentType,
        data: getContext(),
      } as AIGenerateContext;
      const res: GenerateContentResult = await generateContent(ctx);
      if (res.ok) {
        setText(res.text);
        setOpen(true);
      } else {
        toast({
          title: "AI không tạo được nội dung",
          description: res.error,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    onAccept(text);
    setOpen(false);
    toast({ title: "✓ Đã áp dụng nội dung AI", description: `Đã điền ${label}.` });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={runGenerate}
        disabled={loading}
        className="gap-1.5 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        AI tạo {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              Nội dung AI sinh — {label}
            </DialogTitle>
            <DialogDescription>
              Đọc kỹ và chỉnh sửa nếu cần trước khi áp dụng. AI có thể sai sót —
              admin chịu trách nhiệm kiểm duyệt nội dung cuối cùng.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">{text.length} ký tự</p>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={runGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Tạo lại
            </Button>
            <Button
              type="button"
              variant="brand"
              onClick={handleAccept}
              disabled={loading || !text.trim()}
            >
              <Check className="h-4 w-4" />
              Dùng nội dung này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

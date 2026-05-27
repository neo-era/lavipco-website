"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

/**
 * Nút copy mã đơn hàng vào clipboard với feedback ✓ 1.5s.
 */
export function OrderCodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ title: "Đã copy mã đơn hàng", description: code });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Không thể copy",
        description: "Trình duyệt không cho phép truy cập clipboard.",
        variant: "destructive",
      });
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label="Copy mã đơn hàng"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      {copied ? "Đã copy" : "Copy"}
    </Button>
  );
}

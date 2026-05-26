"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Dialog tìm kiếm - dùng cho Header.
 * Hiện tại submit chỉ điều hướng tới /products?q=<query>; Phase sau sẽ
 * mở rộng tìm cả sản phẩm, dự án, blog.
 */
export function SearchDialog({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tìm kiếm</DialogTitle>
          <DialogDescription>
            Nhập từ khoá để tìm sản phẩm, dự án và bài viết.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="search"
            placeholder="VD: đèn LED, đèn tín hiệu giao thông..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            className="flex-1"
          />
          <Button type="submit" variant="brand">
            <Search className="h-4 w-4" />
            Tìm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

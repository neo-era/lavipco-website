"use client";

/**
 * Card hành động admin trên trang chi tiết khách hàng:
 *  - Edit tags (preset VIP/B2B/Loyal + free input)
 *  - Toggle khoá tài khoản (confirm dialog)
 *  - Note nội bộ (auto-save)
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Lock,
  Unlock,
  Save,
  Tag,
  X,
  StickyNote,
} from "lucide-react";

import {
  updateCustomerTags,
  toggleCustomerLock,
  updateCustomerNote,
} from "@/lib/actions/admin-customers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PRESET_TAGS = ["VIP", "B2B", "Loyal", "Wholesale", "Distributor"];

type Props = {
  customerId: string;
  customerName: string;
  initialTags: string[];
  initialNote: string;
  isLocked: boolean;
  isSelf: boolean;
  isAdminRole: boolean;
};

export function AdminCustomerActions({
  customerId,
  customerName,
  initialTags,
  initialNote,
  isLocked,
  isSelf,
  isAdminRole,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();

  const [tags, setTags] = React.useState<string[]>(initialTags);
  const [newTag, setNewTag] = React.useState("");
  const [note, setNote] = React.useState(initialNote);
  const [confirmLockOpen, setConfirmLockOpen] = React.useState(false);

  const tagsDirty = JSON.stringify(tags) !== JSON.stringify(initialTags);
  const noteDirty = note.trim() !== initialNote.trim();

  function addTag(value: string) {
    const v = value.trim();
    if (!v) return;
    if (tags.some((t) => t.toLowerCase() === v.toLowerCase())) {
      toast({
        title: "Tag trùng",
        description: `"${v}" đã có.`,
        variant: "destructive",
      });
      return;
    }
    if (tags.length >= 10) {
      toast({
        title: "Quá giới hạn",
        description: "Tối đa 10 tag.",
        variant: "destructive",
      });
      return;
    }
    setTags([...tags, v]);
    setNewTag("");
  }

  function removeTag(value: string) {
    setTags(tags.filter((t) => t !== value));
  }

  function saveTags() {
    startTransition(async () => {
      const res = await updateCustomerTags(customerId, { tags });
      if (res.ok) {
        toast({ title: "✓ Đã cập nhật tag" });
        router.refresh();
      } else {
        toast({
          title: "Lỗi cập nhật tag",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function saveNote() {
    startTransition(async () => {
      const res = await updateCustomerNote(customerId, { note });
      if (res.ok) {
        toast({ title: "✓ Đã lưu ghi chú" });
        router.refresh();
      } else {
        toast({
          title: "Lỗi lưu ghi chú",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  function handleToggleLock() {
    startTransition(async () => {
      const res = await toggleCustomerLock(customerId);
      if (res.ok) {
        toast({
          title: res.data?.isLocked ? "✓ Đã khoá tài khoản" : "✓ Đã mở khoá",
          description: customerName,
        });
        setConfirmLockOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Lỗi",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  }

  const canLock = !isSelf && !isAdminRole;

  return (
    <div className="space-y-5">
      {/* Tags */}
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Tag className="h-4 w-4 text-brand-primary" />
            Tag khách hàng
          </h3>
          {tagsDirty && (
            <Button
              size="sm"
              variant="brand"
              onClick={saveTags}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Lưu
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có tag.</p>
          ) : (
            tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-full hover:bg-destructive/20"
                  aria-label={`Xoá ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Thêm tag..."
            className="h-9 text-sm"
            list="customer-tag-presets"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(newTag);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addTag(newTag)}
            disabled={!newTag.trim()}
          >
            Thêm
          </Button>
          <datalist id="customer-tag-presets">
            {PRESET_TAGS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Preset gợi ý: {PRESET_TAGS.join(" · ")}
        </p>
      </div>

      {/* Internal note */}
      <div className="space-y-2 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <StickyNote className="h-4 w-4 text-brand-primary" />
            Ghi chú nội bộ
          </h3>
          {noteDirty && (
            <Button
              size="sm"
              variant="brand"
              onClick={saveNote}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Lưu
            </Button>
          )}
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Ghi chú admin (chỉ team thấy)..."
          maxLength={2000}
        />
        <p className="text-[10px] text-muted-foreground">
          {note.length}/2000 ký tự
        </p>
      </div>

      {/* Lock account */}
      <div className="space-y-2 rounded-xl border bg-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {isLocked ? (
            <Lock className="h-4 w-4 text-destructive" />
          ) : (
            <Unlock className="h-4 w-4 text-brand-primary" />
          )}
          Trạng thái tài khoản
        </h3>
        {isLocked && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Tài khoản đang bị khoá - khách không thể đăng nhập.
          </p>
        )}
        {canLock ? (
          <Button
            size="sm"
            variant={isLocked ? "outline" : "destructive"}
            className="w-full"
            onClick={() => setConfirmLockOpen(true)}
            disabled={pending}
          >
            {isLocked ? (
              <>
                <Unlock className="h-3 w-3" />
                Mở khoá tài khoản
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Khoá tài khoản
              </>
            )}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isSelf
              ? "Không thể khoá tài khoản đang đăng nhập."
              : "Không thể khoá tài khoản ADMIN khác."}
          </p>
        )}
      </div>

      {/* Confirm lock dialog */}
      <Dialog open={confirmLockOpen} onOpenChange={setConfirmLockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isLocked ? "Mở khoá tài khoản?" : "Khoá tài khoản?"}
            </DialogTitle>
            <DialogDescription>
              {isLocked
                ? `Khách "${customerName}" sẽ có thể đăng nhập lại bình thường.`
                : `Khách "${customerName}" sẽ không thể đăng nhập. Các session đang mở sẽ bị xoá ngay lập tức. Đơn hàng + dữ liệu cá nhân vẫn được giữ.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmLockOpen(false)}
              disabled={pending}
            >
              Huỷ
            </Button>
            <Button
              variant={isLocked ? "brand" : "destructive"}
              onClick={handleToggleLock}
              disabled={pending}
            >
              {pending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isLocked ? "Mở khoá" : "Khoá tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

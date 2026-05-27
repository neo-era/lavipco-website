"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useToast } from "@/hooks/use-toast";

type Props = {
  productId: string;
  /** Trạng thái ban đầu - server pass xuống nếu user logged-in, null nếu guest. */
  initialIsInWishlist?: boolean | null;
  /** Variant style: "icon-only" (chỉ heart) hoặc "with-label" (heart + text). */
  variant?: "icon-only" | "with-label";
  className?: string;
};

/**
 * Nút ❤️ toggle wishlist. Click khi chưa login → redirect /sign-in.
 * Tối ưu cho dùng trên ProductCard (icon-only floating) hoặc ProductInfo (with-label).
 */
export function WishlistButton({
  productId,
  initialIsInWishlist,
  variant = "icon-only",
  className,
}: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isInWishlist, setIsInWishlist] = React.useState<boolean>(
    initialIsInWishlist ?? false,
  );
  const [pending, setPending] = React.useState(false);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (status === "loading") return;

    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setPending(true);
    const result = await toggleWishlist(productId);
    setPending(false);

    if (!result.ok) {
      toast({
        title: "Lỗi",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    setIsInWishlist(result.isInWishlist);
    toast({
      title: result.isInWishlist
        ? "♥ Đã thêm vào yêu thích"
        : "Đã xoá khỏi yêu thích",
    });
  }

  if (variant === "with-label") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          isInWishlist
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-input bg-background hover:bg-accent",
          className,
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
        )}
        {isInWishlist ? "Đã yêu thích" : "Thêm vào yêu thích"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={isInWishlist ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors",
        isInWishlist
          ? "text-destructive hover:bg-destructive hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-destructive",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart className={cn("h-3.5 w-3.5", isInWishlist && "fill-current")} />
      )}
    </button>
  );
}

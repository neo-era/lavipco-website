"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";

type Props = {
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  /** Stock của variant đang chọn — store sẽ clamp qty về giá trị này. */
  maxStock: number;
  image?: string;
  priceOnRequest?: boolean;
  outOfStock?: boolean;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
};

/**
 * Nút "Thêm vào giỏ" — đổi hành vi theo trạng thái sản phẩm:
 *  - priceOnRequest → link "Liên hệ"
 *  - outOfStock → disabled "Hết hàng"
 *  - default → thêm vào Zustand store + toast (có action "Xem giỏ")
 */
export function AddToCartButton({
  productVariantId,
  productSlug,
  productName,
  variantName,
  unitPrice,
  maxStock,
  image,
  priceOnRequest,
  outOfStock,
  size = "sm",
  variant = "brand",
  className,
}: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  // priceOnRequest → CTA "Liên hệ"
  if (priceOnRequest) {
    return (
      <Button asChild size={size} variant="outline" className={cn(className)}>
        <a href="/contact?type=quotation">
          <Phone className="h-4 w-4" />
          Liên hệ
        </a>
      </Button>
    );
  }

  if (outOfStock) {
    return (
      <Button size={size} variant="outline" disabled className={cn(className)}>
        Hết hàng
      </Button>
    );
  }

  function handleAdd() {
    const { clamped } = addItem({
      productVariantId,
      productSlug,
      productName,
      variantName,
      unitPrice,
      maxStock,
      image,
      quantity: 1,
    });

    if (clamped) {
      toast({
        title: "Đã đạt giới hạn tồn kho",
        description: `Chỉ còn ${maxStock} sản phẩm cho biến thể này. Đã thêm tới mức tối đa.`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "✓ Đã thêm vào giỏ hàng",
      description: variantName ? `${productName} (${variantName})` : productName,
      action: (
        <ToastAction altText="Xem giỏ" onClick={() => router.push("/cart")}>
          Xem giỏ
        </ToastAction>
      ),
    });
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleAdd}
      className={cn(className)}
    >
      <ShoppingCart className="h-4 w-4" />
      Thêm vào giỏ
    </Button>
  );
}

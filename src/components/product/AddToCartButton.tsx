"use client";

import { ShoppingCart, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = {
  productVariantId: string;
  productSlug: string;
  productName: string;
  variantName: string | null;
  unitPrice: number;
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
 *  - default → thêm vào Zustand store + toast
 */
export function AddToCartButton({
  productVariantId,
  productSlug,
  productName,
  variantName,
  unitPrice,
  image,
  priceOnRequest,
  outOfStock,
  size = "sm",
  variant = "brand",
  className,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  // priceOnRequest → CTA "Liên hệ"
  if (priceOnRequest) {
    return (
      <Button
        asChild
        size={size}
        variant="outline"
        className={cn(className)}
      >
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
    addItem({
      productVariantId,
      productSlug,
      productName,
      variantName,
      unitPrice,
      image,
      quantity: 1,
    });
    toast({
      title: "✓ Đã thêm vào giỏ",
      description: variantName ? `${productName} (${variantName})` : productName,
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


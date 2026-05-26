"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  CreditCard,
  FileText,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequestQuoteDialog } from "./RequestQuoteDialog";

export type ProductInfoVariant = {
  id: string;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  isDefault: boolean;
};

type Props = {
  product: {
    slug: string;
    name: string;
    brand: string | null;
    shortDescription: string | null;
    basePrice: number;
    priceOnRequest: boolean;
    isFeatured: boolean;
    images: string[];
    catalogueUrl: string | null;
  };
  variants: ProductInfoVariant[];
};

const MAX_QTY = 99;

export function ProductInfo({ product, variants }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  // Variant đang chọn
  const defaultVariant =
    variants.find((v) => v.isDefault) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    defaultVariant?.id ?? null,
  );
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? defaultVariant;

  // Số lượng
  const [quantity, setQuantity] = React.useState(1);

  // Tổng stock của tất cả variant (cho badge "Hết hàng")
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const outOfStock = totalStock === 0 && !product.priceOnRequest;
  const selectedStock = selectedVariant?.stock ?? 0;

  // Giá hiển thị: variant.price (nếu có), fallback basePrice
  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const cover = product.images[0];

  function handleAdd() {
    if (!selectedVariant || product.priceOnRequest) return;
    addItem({
      productVariantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      unitPrice: selectedVariant.price,
      image: cover,
      quantity,
    });
    toast({
      title: "✓ Đã thêm vào giỏ",
      description: selectedVariant.name
        ? `${product.name} (${selectedVariant.name}) × ${quantity}`
        : `${product.name} × ${quantity}`,
    });
  }

  function handleBuyNow() {
    if (!selectedVariant || product.priceOnRequest) return;
    addItem({
      productVariantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      unitPrice: selectedVariant.price,
      image: cover,
      quantity,
    });
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      {/* Header: brand + name + SKU + reviews placeholder */}
      <div className="space-y-2">
        {product.brand && (
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
        )}
        <h1 className="text-balance text-3xl font-bold leading-tight md:text-4xl">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {selectedVariant && (
            <span>
              SKU: <span className="font-mono text-foreground">{selectedVariant.sku}</span>
            </span>
          )}
          {/* Đánh giá placeholder - chưa có Review model */}
          <span className="flex items-center gap-1">
            <span className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-muted text-muted" />
              ))}
            </span>
            <span className="text-xs">(Chưa có đánh giá)</span>
          </span>
          {product.isFeatured && (
            <Badge variant="accent" className="rounded-full">
              Nổi bật
            </Badge>
          )}
        </div>
      </div>

      {/* Giá */}
      <div className="border-y py-5">
        {product.priceOnRequest ? (
          <div>
            <p className="text-sm text-muted-foreground">Giá sản phẩm</p>
            <p className="mt-1 text-2xl font-bold text-brand-primary md:text-3xl">
              Liên hệ báo giá
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sản phẩm theo cấu hình dự án — vui lòng yêu cầu báo giá để có giá phù hợp.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">Giá đã bao gồm VAT</p>
            <p className="mt-1 text-3xl font-bold text-brand-primary md:text-4xl">
              {formatCurrency(displayPrice)}
            </p>
            {selectedVariant && (
              <p className="mt-1 text-xs text-muted-foreground">
                Còn{" "}
                <span className="font-medium text-foreground">{selectedStock}</span>{" "}
                sản phẩm
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mô tả ngắn */}
      {product.shortDescription && (
        <p className="text-base leading-relaxed text-muted-foreground">
          {product.shortDescription}
        </p>
      )}

      {/* Variant picker - chỉ render khi có >1 variant */}
      {variants.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Chọn phiên bản</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  selectedVariantId === v.id
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border bg-background hover:border-brand-primary/40",
                  v.stock === 0 && "opacity-60",
                )}
                aria-pressed={selectedVariantId === v.id}
                disabled={v.stock === 0 && !product.priceOnRequest}
                title={v.stock === 0 ? "Hết hàng" : undefined}
              >
                {v.name ?? v.sku}
                {v.stock === 0 && (
                  <span className="ml-2 text-[10px] text-muted-foreground">(hết)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Số lượng */}
      {!product.priceOnRequest && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Số lượng</p>
          <div className="inline-flex items-center rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-none"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Giảm số lượng"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              max={Math.min(MAX_QTY, selectedStock || MAX_QTY)}
              value={quantity}
              onChange={(event) => {
                const n = Number(event.target.value) || 1;
                setQuantity(Math.max(1, Math.min(MAX_QTY, n)));
              }}
              className="h-10 w-16 rounded-none border-x border-y-0 text-center [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-none"
              onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
              aria-label="Tăng số lượng"
              disabled={quantity >= MAX_QTY}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="space-y-3">
        {!product.priceOnRequest && (
          <>
            <Button
              size="xl"
              variant="brand"
              onClick={handleAdd}
              disabled={outOfStock || !selectedVariant}
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4" />
              {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleBuyNow}
              disabled={outOfStock || !selectedVariant}
              className="w-full"
            >
              <CreditCard className="h-4 w-4" />
              Mua ngay
            </Button>
          </>
        )}

        <RequestQuoteDialog productSlug={product.slug} productName={product.name}>
          <Button
            size={product.priceOnRequest ? "xl" : "lg"}
            variant={product.priceOnRequest ? "brand" : "ghost"}
            className="w-full"
          >
            <FileText className="h-4 w-4" />
            Yêu cầu báo giá
          </Button>
        </RequestQuoteDialog>
      </div>

      {/* Box thông tin chính sách */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-xs">
        <PolicyItem Icon={Truck} title="Vận chuyển toàn quốc" />
        <PolicyItem Icon={ShieldCheck} title="Bảo hành chính hãng" />
        <PolicyItem Icon={RotateCcw} title="Đổi trả trong 7 ngày" />
        <PolicyItem Icon={Headphones} title="Hỗ trợ kỹ thuật 24/7" />
      </div>
    </div>
  );
}

function PolicyItem({
  Icon,
  title,
}: {
  Icon: typeof Truck;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-brand-primary" />
      <span className="text-foreground/80">{title}</span>
    </div>
  );
}

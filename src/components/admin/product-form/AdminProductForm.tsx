"use client";

/**
 * Form quản lý sản phẩm cho /admin/products/new và /admin/products/[id].
 *
 * Cấu trúc 7 card theo Prompt 5.2:
 *  1. Thông tin cơ bản (name, slug, brand, category, mô tả)
 *  2. Giá và kho (priceOnRequest, basePrice, simpleStock)
 *  3. Hình ảnh (uploader → data URL hoặc Cloudinary)
 *  4. Thông số kỹ thuật (key/value/unit repeater)
 *  5. Biến thể (Switch hasVariants + combination builder)
 *  6. SEO (metaTitle, metaDescription)
 *  7. Cấu hình (status, isFeatured, catalogueUrl)
 *
 * StickyBar dưới đáy: Huỷ / Lưu nháp / Lưu (auto handle dirty state).
 *
 * `mode`:
 *  - "create" → gọi createProduct, redirect /admin/products/[id] sau khi tạo.
 *  - "edit"   → gọi updateProduct, ở lại trang, refresh router.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import {
  productInputSchema,
  type ProductInput,
} from "@/lib/validations/admin-product";
import { createProduct, updateProduct } from "@/lib/actions/admin-products";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ProductImageUploader } from "./ProductImageUploader";
import { ProductSpecsRepeater } from "./ProductSpecsRepeater";
import { ProductVariantBuilder } from "./ProductVariantBuilder";

type Category = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  /** Khi edit: id sản phẩm. */
  productId?: string;
  categories: Category[];
  defaultValues: ProductInput;
};

const STATUS_OPTIONS: Array<{ value: "DRAFT" | "ACTIVE" | "ARCHIVED"; label: string; hint: string }> = [
  { value: "DRAFT", label: "Nháp", hint: "Không hiển thị ngoài site" },
  { value: "ACTIVE", label: "Đang bán", hint: "Hiển thị công khai" },
  { value: "ARCHIVED", label: "Lưu trữ", hint: "Ẩn nhưng giữ data đơn cũ" },
];

export function AdminProductForm({
  mode,
  productId,
  categories,
  defaultValues,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const priceOnRequest = form.watch("priceOnRequest");
  const hasVariants = form.watch("hasVariants");
  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");

  // Auto-fill slug từ name (chỉ khi slug đang trống — không ghi đè manual edit)
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  React.useEffect(() => {
    if (!slugTouched && watchedName) {
      form.setValue("slug", slugify(watchedName), { shouldValidate: false });
    }
  }, [watchedName, slugTouched, form]);

  // Auto-fill metaTitle từ name (chỉ khi metaTitle đang rỗng)
  const [metaTitleTouched, setMetaTitleTouched] = React.useState(
    Boolean(defaultValues.metaTitle),
  );
  React.useEffect(() => {
    if (!metaTitleTouched && watchedName) {
      form.setValue("metaTitle", watchedName.slice(0, 160), { shouldValidate: false });
    }
  }, [watchedName, metaTitleTouched, form]);

  async function onSubmit(values: ProductInput) {
    const result =
      mode === "create"
        ? await createProduct(values)
        : await updateProduct(productId!, values);

    if (!result.ok) {
      if (result.fieldErrors) {
        (Object.entries(result.fieldErrors) as [keyof ProductInput, string[]][]).forEach(
          ([field, msgs]) => {
            if (msgs?.[0]) form.setError(field, { message: msgs[0] });
          },
        );
      }
      toast({
        title: mode === "create" ? "Tạo sản phẩm thất bại" : "Cập nhật thất bại",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title:
        mode === "create"
          ? "✓ Đã tạo sản phẩm"
          : "✓ Đã cập nhật sản phẩm",
      description: values.name,
    });

    if (mode === "create" && result.data?.id) {
      router.push(`/admin/products/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  async function saveAsDraft() {
    form.setValue("status", "DRAFT");
    await form.handleSubmit(onSubmit)();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 pb-24"
        >
          {/* Card 1: Thông tin cơ bản */}
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">1. Thông tin cơ bản</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Tên sản phẩm <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Đèn LED đường phố 150W Smart"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug URL <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          setSlugTouched(true);
                          field.onChange(e.target.value);
                        }}
                        placeholder="den-led-150w-smart"
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      URL: /products/<strong>{watchedSlug || "..."}</strong>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thương hiệu</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="VD: Philips, Osram, LAVIPCO..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Danh mục <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Tóm tắt 1-2 câu, hiển thị ở card sản phẩm và đầu trang chi tiết."
                        rows={2}
                        maxLength={500}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {(field.value ?? "").length}/500 ký tự
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Mô tả đầy đủ về sản phẩm. Hỗ trợ Markdown cơ bản: **bold**, *italic*, - bullet, ## heading."
                        rows={8}
                        maxLength={20_000}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Hỗ trợ Markdown — sẽ render thành HTML ở trang sản phẩm.
                      {(field.value ?? "").length.toLocaleString()}/20.000 ký tự
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Card 2: Giá và kho */}
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">2. Giá và kho</h2>

            <FormField
              control={form.control}
              name="priceOnRequest"
              render={({ field }) => (
                <FormItem className="flex items-start justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Liên hệ báo giá</FormLabel>
                    <FormDescription className="text-xs">
                      Sản phẩm dự án — không hiển thị giá công khai. Khách phải gửi
                      yêu cầu báo giá.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!priceOnRequest && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá cơ bản (VND) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value),
                            )
                          }
                          placeholder="VD: 1500000"
                          className="text-right tabular-nums"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Đã bao gồm VAT 10%. Khi có biến thể, giá từng biến thể
                        sẽ override giá cơ bản.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!hasVariants && (
                  <FormField
                    control={form.control}
                    name="simpleStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tồn kho</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={99999}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            className="text-right tabular-nums"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Số lượng sẵn có. Khi bật &quot;Có biến thể&quot; thì tồn kho
                          tính từ tổng các biến thể.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </Card>

          {/* Card 3: Hình ảnh */}
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">3. Hình ảnh</h2>
            <ProductImageUploader />
            <FormField
              control={form.control}
              name="images"
              render={() => <FormMessage />}
            />
          </Card>

          {/* Card 4: Thông số kỹ thuật */}
          <Card className="p-5">
            <h2 className="mb-1 text-base font-bold">4. Thông số kỹ thuật</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Hiển thị dạng bảng ở trang chi tiết sản phẩm. Ví dụ: Công suất 100 W,
              Nhiệt độ màu 5000 K, Chỉ số IP IP66.
            </p>
            <ProductSpecsRepeater />
          </Card>

          {/* Card 5: Biến thể */}
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold">5. Biến thể</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bật khi sản phẩm có nhiều phiên bản (màu, công suất, kích cỡ...).
                  Mỗi biến thể có SKU, giá, tồn kho riêng.
                </p>
              </div>
              <FormField
                control={form.control}
                name="hasVariants"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {hasVariants && (
              <ProductVariantBuilder slug={watchedSlug} />
            )}
            <FormField
              control={form.control}
              name="variants"
              render={() => <FormMessage />}
            />
          </Card>

          {/* Card 6: SEO */}
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">6. SEO</h2>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta title</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) => {
                          setMetaTitleTouched(true);
                          field.onChange(e.target.value);
                        }}
                        placeholder="Tự sinh từ tên sản phẩm nếu để trống"
                        maxLength={160}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {(field.value ?? "").length}/160 ký tự. Google ưu tiên 50-60 ký tự đầu.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta description</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Mô tả hiển thị dưới tiêu đề ở kết quả Google. Tự sinh từ mô tả ngắn nếu để trống."
                        rows={3}
                        maxLength={320}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {(field.value ?? "").length}/320 ký tự. Google ưu tiên 150-160 ký tự đầu.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Card 7: Cấu hình */}
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">7. Cấu hình</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="font-medium">{s.label}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              — {s.hint}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Sản phẩm nổi bật</FormLabel>
                      <FormDescription className="text-xs">
                        Hiển thị trên trang chủ và slot &quot;Sản phẩm tiêu biểu&quot;.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="catalogueUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>URL Catalogue PDF</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="https://res.cloudinary.com/.../catalogue.pdf"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Hiển thị nút &quot;Tải catalogue&quot; ở trang chi tiết. Để trống nếu chưa có.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:left-64">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {form.formState.isDirty ? (
                  <span className="font-medium text-accent">● Có thay đổi chưa lưu</span>
                ) : mode === "edit" ? (
                  "Chưa có thay đổi."
                ) : (
                  "Sẵn sàng tạo sản phẩm mới."
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="ghost" type="button">
                  <Link href="/admin/products">
                    <X className="h-4 w-4" />
                    Huỷ
                  </Link>
                </Button>
                {mode === "create" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveAsDraft}
                    disabled={form.formState.isSubmitting}
                  >
                    Lưu nháp
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="brand"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

"use client";

/**
 * Form Settings 7 tab. Lưu toàn bộ giá trị (kể cả tab khác) khi bấm "Lưu" mỗi tab.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import {
  settingsInputSchema,
  type SettingsInput,
} from "@/lib/validations/admin-setting";
import { updateSettings } from "@/lib/actions/admin-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type Props = {
  defaultValues: SettingsInput;
};

export function AdminSettingsForm({ defaultValues }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsInputSchema),
    defaultValues,
    mode: "onSubmit",
  });

  async function onSubmit(values: SettingsInput) {
    const res = await updateSettings(values);
    if (!res.ok) {
      toast({
        title: "Lưu thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✓ Đã lưu cấu hình" });
    form.reset(values); // reset dirty state
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 pb-24"
        >
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Thông tin chung</h2>
                <FormField
                  control={form.control}
                  name="general_siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên site</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="LAVIPCO" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general_tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Giải pháp đèn tín hiệu giao thông & chiếu sáng đô thị" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="general_logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://... hoặc /images/logo.png"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          URL ảnh logo. Upload qua Cloudinary và paste URL về đây.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general_favicon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="/favicon.ico" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Thông tin liên hệ</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_hotline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotline</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1900 0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="info@lavipco.com.vn"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="contact_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Số nhà, đường, phường, quận, thành phố"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact_taxCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MST (Mã số thuế)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0123456789" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_workingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ làm việc</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="T2 - T7: 08:00 - 17:30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Social */}
            <TabsContent value="social" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Mạng xã hội</h2>
                <FormField
                  control={form.control}
                  name="social_facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://facebook.com/lavipco"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social_zalo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zalo URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://zalo.me/..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social_youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://youtube.com/@lavipco"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </TabsContent>

            {/* Payment */}
            <TabsContent value="payment" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Thanh toán</h2>
                <FormField
                  control={form.control}
                  name="payment_codEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Bật COD (Thanh toán khi nhận hàng)</FormLabel>
                        <FormDescription className="text-xs">
                          Hiển thị COD ở trang checkout.
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
                  name="payment_vnpayEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Bật VNPay</FormLabel>
                        <FormDescription className="text-xs">
                          Cần cấu hình VNPAY_TMN_CODE + SECRET_KEY ở .env.
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
                  name="payment_bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thông tin chuyển khoản</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={8}
                          placeholder={
                            "Tài khoản 1:\n" +
                            "Ngân hàng: Vietcombank - CN ...\n" +
                            "Số TK: 0123456789\n" +
                            "Chủ TK: CONG TY TNHH KY NGHE LAM VIET PHAT\n\n" +
                            "Tài khoản 2:\n" +
                            "Ngân hàng: ...\n" +
                            "Số TK: ...\n" +
                            "Chủ TK: ..."
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Hiển thị ở checkout khi khách chọn Chuyển khoản ngân hàng.
                        Có thể nhập nhiều tài khoản — mỗi dòng xuống dòng sẽ giữ
                        nguyên khi hiển thị cho khách.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </TabsContent>

            {/* Shipping */}
            <TabsContent value="shipping" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Vận chuyển</h2>
                <FormField
                  control={form.control}
                  name="shipping_ghnEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Dùng GHN API</FormLabel>
                        <FormDescription className="text-xs">
                          Tính phí ship realtime qua GHN. Cần GHN_API_TOKEN ở .env.
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
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="shipping_defaultFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phí ship mặc định (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="30000"
                            className="text-right tabular-nums"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Áp dụng khi GHN tắt hoặc fail.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipping_freeThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FREE SHIP từ (VND)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={10_000}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : Number(e.target.value),
                              )
                            }
                            placeholder="Để trống = không miễn phí ship"
                            className="text-right tabular-nums"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Email */}
            <TabsContent value="email" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">Email</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email_fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="LAVIPCO" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email_fromAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="no-reply@lavipco.com.vn"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Override EMAIL_FROM trong .env.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email_replyTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-to</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="support@lavipco.com.vn"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="mt-5">
              <Card className="space-y-4 p-5">
                <h2 className="text-base font-bold">SEO & Analytics</h2>
                <FormField
                  control={form.control}
                  name="seo_defaultMetaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta title mặc định</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={160}
                          placeholder="LAVIPCO - Giải pháp chiếu sáng đô thị"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value.length}/160 ký tự
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo_defaultMetaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta description mặc định</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          maxLength={320}
                          placeholder="Mô tả site hiển thị ở SERP Google."
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {field.value.length}/320 ký tự
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="seo_googleAnalyticsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Analytics ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="G-XXXXXXXXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seo_googleTagManagerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Tag Manager ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="GTM-XXXXXXX" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sticky save bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:left-64">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {form.formState.isDirty
                  ? "● Có thay đổi chưa lưu"
                  : "Chưa có thay đổi"}
              </div>
              <Button
                type="submit"
                variant="brand"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Lưu cấu hình
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}

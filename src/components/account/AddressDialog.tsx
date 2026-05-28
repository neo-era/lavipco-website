"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil } from "lucide-react";

import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { createAddress, updateAddress } from "@/lib/actions/address";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressFields } from "@/components/checkout/AddressFields";

type Props = {
  /** Nếu có → mode edit, ngược lại mode create. */
  initial?: AddressInput & { id: string };
  /** Cho trigger custom. Mặc định = Button "+ Thêm địa chỉ". */
  children?: React.ReactNode;
};

const DEFAULTS: AddressInput = {
  fullName: "",
  phone: "",
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  street: "",
  isDefault: false,
};

export function AddressDialog({ initial, children }: Props) {
  const isEdit = Boolean(initial);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? DEFAULTS,
  });

  // Reset form khi dialog mở/đóng (chỉ với mode edit)
  React.useEffect(() => {
    if (open) {
      form.reset(initial ?? DEFAULTS);
    }
  }, [open, initial, form]);

  async function onSubmit(values: AddressInput) {
    const result = isEdit
      ? await updateAddress(initial!.id, values)
      : await createAddress(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        (Object.entries(result.fieldErrors) as [keyof AddressInput, string[]][]).forEach(
          ([field, msgs]) => {
            if (msgs[0]) form.setError(field, { message: msgs[0] });
          },
        );
      }
      toast({
        title: isEdit ? "Cập nhật thất bại" : "Thêm địa chỉ thất bại",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isEdit ? "✓ Đã cập nhật địa chỉ" : "✓ Đã thêm địa chỉ",
    });
    setOpen(false);
  }

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" size="sm">
      <Pencil className="h-3.5 w-3.5" />
      Sửa
    </Button>
  ) : (
    <Button variant="brand" size="sm">
      <Plus className="h-4 w-4" />
      Thêm địa chỉ
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
          <DialogDescription>
            Địa chỉ sẽ dùng khi giao hàng các đơn LAVIPCO.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Họ tên người nhận <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số điện thoại <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reuse AddressFields (3 cascade selects + street) */}
              <AddressFields />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex cursor-pointer items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                        />
                      </FormControl>
                      <span className="text-sm">Đặt làm địa chỉ mặc định</span>
                    </label>
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Lưu thay đổi" : "Thêm địa chỉ"}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

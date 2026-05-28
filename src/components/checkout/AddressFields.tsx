"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import type { Province, Ward } from "@/lib/regions";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

/**
 * Subset field mà AddressFields cần. Cả CheckoutInput và AddressInput
 * đều có các field này nên reuse được qua FormProvider chung.
 *
 * Cấu trúc 2 cấp sau sáp nhập 2025: Tỉnh/Thành → Phường/Xã (không còn Quận/Huyện).
 */
type AddressFormShape = {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  street: string;
};

/**
 * 2 cascading selects: Tỉnh/Thành → Phường/Xã.
 *
 * Fetch từ /api/regions/* khi mount + khi tỉnh thay đổi. Cập nhật cả 2 trường:
 *   - <field>Code (submit) + <field>Name (snapshot hiển thị).
 */
export function AddressFields() {
  const form = useFormContext<AddressFormShape>();
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [wards, setWards] = React.useState<Ward[]>([]);

  const provinceCode = form.watch("provinceCode");

  // Load provinces 1 lần
  React.useEffect(() => {
    fetch("/api/regions/provinces")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch(() => setProvinces([]));
  }, []);

  // Load wards khi provinceCode thay đổi
  React.useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    fetch(`/api/regions/wards?provinceCode=${provinceCode}`)
      .then((res) => res.json())
      .then((data: Ward[]) => setWards(data))
      .catch(() => setWards([]));
  }, [provinceCode]);

  function handleProvinceChange(code: string) {
    const province = provinces.find((p) => p.code === code);
    form.setValue("provinceCode", code, { shouldValidate: true });
    form.setValue("provinceName", province?.name ?? "");
    // Reset ward
    form.setValue("wardCode", "");
    form.setValue("wardName", "");
  }

  function handleWardChange(code: string) {
    const ward = wards.find((w) => w.code === code);
    form.setValue("wardCode", code, { shouldValidate: true });
    form.setValue("wardName", ward?.name ?? "");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Province */}
        <FormField
          control={form.control}
          name="provinceCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tỉnh/Thành <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={handleProvinceChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tỉnh/thành" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ward */}
        <FormField
          control={form.control}
          name="wardCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phường/Xã <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={handleWardChange}
                value={field.value}
                disabled={!provinceCode || wards.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={provinceCode ? "Chọn phường/xã" : "Chọn tỉnh trước"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.code} value={w.code}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Địa chỉ cụ thể <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Số nhà, tên đường, khu phố/ấp..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";

import type { Province, District, Ward } from "@/lib/regions";
import type { CheckoutInput } from "@/lib/validations/checkout";
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
 * 3 cascading selects: Tỉnh → Quận/Huyện → Phường/Xã.
 *
 * Fetch từ /api/regions/* khi mount + khi parent thay đổi. Cập nhật cả 2 trường:
 *   - <field>Code (lưu vào form để submit)
 *   - <field>Name (lưu để snapshot + GHN lookup)
 */
export function AddressFields() {
  const form = useFormContext<CheckoutInput>();
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [wards, setWards] = React.useState<Ward[]>([]);

  const provinceCode = form.watch("provinceCode");
  const districtCode = form.watch("districtCode");

  // Load provinces 1 lần
  React.useEffect(() => {
    fetch("/api/regions/provinces")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch(() => setProvinces([]));
  }, []);

  // Load districts khi provinceCode thay đổi
  React.useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }
    fetch(`/api/regions/districts?provinceCode=${provinceCode}`)
      .then((res) => res.json())
      .then((data: District[]) => setDistricts(data))
      .catch(() => setDistricts([]));
  }, [provinceCode]);

  // Load wards khi districtCode thay đổi
  React.useEffect(() => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    fetch(`/api/regions/wards?districtCode=${districtCode}`)
      .then((res) => res.json())
      .then((data: Ward[]) => setWards(data))
      .catch(() => setWards([]));
  }, [districtCode]);

  function handleProvinceChange(code: string) {
    const province = provinces.find((p) => p.code === code);
    form.setValue("provinceCode", code, { shouldValidate: true });
    form.setValue("provinceName", province?.name ?? "");
    // Reset district + ward
    form.setValue("districtCode", "");
    form.setValue("districtName", "");
    form.setValue("wardCode", "");
    form.setValue("wardName", "");
  }

  function handleDistrictChange(code: string) {
    const district = districts.find((d) => d.code === code);
    form.setValue("districtCode", code, { shouldValidate: true });
    form.setValue("districtName", district?.name ?? "");
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
      <div className="grid gap-4 sm:grid-cols-3">
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

        {/* District */}
        <FormField
          control={form.control}
          name="districtCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Quận/Huyện <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={handleDistrictChange}
                value={field.value}
                disabled={!provinceCode || districts.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={provinceCode ? "Chọn quận/huyện" : "Chọn tỉnh trước"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.name}
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
                disabled={!districtCode || wards.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={districtCode ? "Chọn phường/xã" : "Chọn huyện trước"}
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

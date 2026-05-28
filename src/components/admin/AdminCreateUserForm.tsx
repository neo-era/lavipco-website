"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";

import {
  createInternalUserSchema,
  type CreateInternalUserInput,
} from "@/lib/validations/admin-user";
import { createInternalUser } from "@/lib/actions/admin-customers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function AdminCreateUserForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateInternalUserInput>({
    resolver: zodResolver(createInternalUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "STAFF" },
    mode: "onSubmit",
  });

  async function onSubmit(values: CreateInternalUserInput) {
    const res = await createInternalUser(values);
    if (!res.ok) {
      if (res.fieldErrors) {
        (
          Object.entries(res.fieldErrors) as [keyof CreateInternalUserInput, string[]][]
        ).forEach(([f, msgs]) => {
          if (msgs?.[0]) form.setError(f, { message: msgs[0] });
        });
      }
      toast({
        title: "Tạo tài khoản thất bại",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✓ Đã tạo tài khoản", description: values.email });
    if (res.data?.id) {
      router.push(`/admin/customers/${res.data.id}`);
    } else {
      router.push("/admin/users");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Card className="space-y-4 p-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Họ và tên <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="VD: Nguyễn Văn A" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="nhanvien@lavipco.tech" />
                </FormControl>
                <FormDescription className="text-xs">
                  Dùng để đăng nhập. Không trùng với tài khoản đã có.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mật khẩu <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    placeholder="≥8 ký tự, có chữ + số"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Gửi mật khẩu này cho nhân viên qua kênh an toàn; họ nên đổi sau
                  khi đăng nhập.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Vai trò <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STAFF">STAFF — Nhân viên</SelectItem>
                    <SelectItem value="ADMIN">ADMIN — Quản trị (toàn quyền)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Chỉ cấp ADMIN cho người tin cậy — ADMIN có toàn quyền hệ thống.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="ghost" type="button">
            <Link href="/admin/users">
              <X className="h-4 w-4" /> Huỷ
            </Link>
          </Button>
          <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Tạo tài khoản
          </Button>
        </div>
      </form>
    </Form>
  );
}

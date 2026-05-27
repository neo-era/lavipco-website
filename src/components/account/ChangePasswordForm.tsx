"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";

import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/password";
import { changePassword } from "@/lib/actions/password";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ChangePasswordForm() {
  const { toast } = useToast();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordInput) {
    const result = await changePassword(values);

    if (result.ok) {
      toast({
        title: "✓ Đổi mật khẩu thành công",
        description: "Lần đăng nhập tiếp theo dùng mật khẩu mới.",
      });
      form.reset();
      return;
    }

    if (result.fieldErrors) {
      (Object.entries(result.fieldErrors) as [keyof ChangePasswordInput, string[]][]).forEach(
        ([field, msgs]) => {
          if (msgs[0]) form.setError(field, { message: msgs[0] });
        },
      );
      return;
    }

    toast({
      title: "Đổi mật khẩu thất bại",
      description: result.error,
      variant: "destructive",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mật khẩu hiện tại <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mật khẩu mới <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>
                Tối thiểu 8 ký tự, có chữ và số.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Xác nhận mật khẩu mới <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Đổi mật khẩu
        </Button>
      </form>
    </Form>
  );
}

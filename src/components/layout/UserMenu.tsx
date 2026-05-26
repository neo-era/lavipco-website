"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User, LogOut, ShoppingBag, LayoutDashboard, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Dropdown menu cho user — đọc session từ Auth.js (qua SessionProvider).
 *
 * - Loading: skeleton.
 * - Chưa login: nút "Đăng nhập" link tới /sign-in.
 * - Đã login: dropdown với Tài khoản / Đơn hàng / (Quản trị nếu ADMIN) / Đăng xuất.
 */
export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Button asChild variant="brand" size="sm">
        <Link href="/sign-in">Đăng nhập</Link>
      </Button>
    );
  }

  const { name, email, role } = session.user;
  // Tên hiển thị ưu tiên name → phần trước @ của email
  const displayName = name || email?.split("@")[0] || "Bạn";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Tài khoản của ${displayName}`}>
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{displayName}</span>
            {email && <span className="text-xs text-muted-foreground">{email}</span>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User className="h-4 w-4" />
            Tài khoản
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">
            <ShoppingBag className="h-4 w-4" />
            Đơn hàng
          </Link>
        </DropdownMenuItem>
        {role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Quản trị
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

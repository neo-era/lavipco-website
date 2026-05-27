"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { UserCircle, LogOut, Settings, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminUserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null; // Middleware đã chặn, nhưng phòng race condition
  }

  const displayName =
    session.user.name || session.user.email?.split("@")[0] || "Admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label="Tài khoản admin">
          <UserCircle className="h-5 w-5" />
          <span className="hidden text-sm font-medium md:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{displayName}</span>
            {session.user.email && (
              <span className="text-xs text-muted-foreground">{session.user.email}</span>
            )}
            <span className="mt-1 text-[10px] uppercase tracking-wider text-brand-primary">
              {session.user.role}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <Globe className="h-4 w-4" />
            Xem website
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" />
            Cài đặt
          </Link>
        </DropdownMenuItem>
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

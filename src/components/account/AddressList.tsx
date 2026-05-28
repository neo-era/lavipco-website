"use client";

import * as React from "react";
import { Star, Trash2, MapPin, Phone, Loader2 } from "lucide-react";
import type { Address } from "@prisma/client";

import { cn } from "@/lib/utils";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/address";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddressDialog } from "./AddressDialog";
import type { AddressInput } from "@/lib/validations/address";

/**
 * Hiển thị list địa chỉ + actions: Set default, Edit (qua AddressDialog), Delete.
 */
export function AddressList({ addresses }: { addresses: Address[] }) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card py-12 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Bạn chưa lưu địa chỉ nào. Thêm địa chỉ để dùng khi đặt hàng.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {addresses.map((address) => (
        <AddressRow key={address.id} address={address} />
      ))}
    </ul>
  );
}

function AddressRow({ address }: { address: Address }) {
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = React.useState<
    "setDefault" | "delete" | null
  >(null);

  // Map DB Address (province/district/ward fields = name strings) → AddressInput
  const editValues: AddressInput & { id: string } = {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    provinceCode: address.provinceCode ?? "",
    provinceName: address.province,
    wardCode: address.wardCode ?? "",
    wardName: address.ward,
    street: address.street,
    isDefault: address.isDefault,
  };

  async function handleSetDefault() {
    setPendingAction("setDefault");
    const result = await setDefaultAddress(address.id);
    setPendingAction(null);
    if (!result.ok) {
      toast({
        title: "Không cập nhật được",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✓ Đã đặt làm mặc định" });
  }

  async function handleDelete() {
    setPendingAction("delete");
    const result = await deleteAddress(address.id);
    setPendingAction(null);
    if (!result.ok) {
      toast({
        title: "Không xoá được",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "✓ Đã xoá địa chỉ" });
  }

  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-5 transition-colors",
        address.isDefault && "border-brand-primary/40 bg-brand-primary/5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{address.fullName}</p>
            {address.isDefault && (
              <Badge variant="brand" className="rounded-full text-[10px]">
                Mặc định
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {address.phone}
          </p>
          <p className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>
              {address.street}, {address.ward}, {address.province}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              disabled={pendingAction !== null}
            >
              {pendingAction === "setDefault" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Star className="h-3.5 w-3.5" />
              )}
              Đặt mặc định
            </Button>
          )}
          <AddressDialog initial={editValues} />
          <DeleteAddressDialog
            onConfirm={handleDelete}
            pending={pendingAction === "delete"}
          />
        </div>
      </div>
    </li>
  );
}

function DeleteAddressDialog({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  function handleClick() {
    onConfirm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Xoá
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xoá địa chỉ này?</DialogTitle>
          <DialogDescription>
            Địa chỉ sẽ bị xoá vĩnh viễn khỏi sổ địa chỉ của bạn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Huỷ
          </Button>
          <Button variant="destructive" onClick={handleClick} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Xoá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

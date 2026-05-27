import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressDialog } from "@/components/account/AddressDialog";
import { AddressList } from "@/components/account/AddressList";

export const metadata: Metadata = {
  title: "Sổ địa chỉ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/addresses");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Sổ địa chỉ</h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý các địa chỉ giao hàng. Địa chỉ mặc định sẽ được chọn sẵn khi
            đặt hàng.
          </p>
        </div>
        <AddressDialog />
      </div>

      <AddressList addresses={addresses} />
    </div>
  );
}

import type { Metadata } from "next";

import { PlaceholderSection } from "@/components/common/PlaceholderSection";

export const metadata: Metadata = {
  title: "Thanh toán",
};

export default function CheckoutPage() {
  return (
    <PlaceholderSection
      title="Thanh toán"
      description="Quy trình checkout: nhập địa chỉ giao hàng, chọn phương thức thanh toán (VNPay/MoMo/COD) và xác nhận đơn."
      phase="Giai đoạn 4"
    />
  );
}

import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Hoàn tất đơn hàng LAVIPCO - nhập địa chỉ và chọn phương thức thanh toán.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <section className="border-b bg-muted/20">
        <Container className="py-4">
          <Breadcrumb
            items={[
              { title: "Giỏ hàng", href: "/cart" },
              { title: "Thanh toán" },
            ]}
          />
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold md:text-4xl">Thanh toán</h1>
            <p className="mt-2 text-muted-foreground">
              Kiểm tra thông tin giao hàng và chọn phương thức thanh toán phù hợp.
            </p>
          </div>
          <CheckoutForm />
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CartContents } from "@/components/cart/CartContents";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Xem giỏ hàng và tiến hành thanh toán đơn hàng của bạn tại LAVIPCO.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <section className="border-b bg-muted/20">
        <Container className="py-4">
          <Breadcrumb items={[{ title: "Giỏ hàng" }]} />
        </Container>
      </section>

      <section className="py-10 md:py-12">
        <Container>
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold md:text-4xl">Giỏ hàng</h1>
            <p className="mt-2 text-muted-foreground">
              Xem lại sản phẩm bạn đã chọn trước khi tiến hành thanh toán.
            </p>
          </div>
          <CartContents />
        </Container>
      </section>
    </>
  );
}

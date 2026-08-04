import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description:
    "Compra sin crear cuenta: solo tus datos de entrega y el método de pago. Nequi, Bancolombia o transferencia. Envíos en Medellín.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ya casi"
        title="Finalizar"
        highlight="compra"
        description="Sin cuenta, sin contraseñas, sin datos de tarjeta. Solo lo necesario para llevarte el pedido a la puerta."
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Finalizar compra", href: "/checkout" },
        ]}
      />

      <section className="pb-24 md:pb-32">
        <CheckoutForm />
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { getSiteSettings } from "@/services/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";

/** Los medios de pago y la cobertura salen del panel, no del código. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const details = [
    settings.paymentMethods.length > 0 && `Paga con ${settings.paymentMethods.join(", ")}.`,
    settings.shippingZone && `Entregas en ${settings.shippingZone}.`,
  ].filter(Boolean);

  return {
    title: "Finalizar compra",
    description: [
      "Compra sin crear cuenta: solo tus datos de entrega y el método de pago.",
      ...details,
    ].join(" "),
    alternates: { canonical: "/checkout" },
    robots: { index: false, follow: false },
  };
}

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

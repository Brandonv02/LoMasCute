import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listProducts } from "@/services/products";
import { PageHeading } from "@/components/admin/ui";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import {
  SaleForm,
  type ProductOption,
} from "@/app/admin/(panel)/pedidos/sale-form";

export const metadata: Metadata = { title: "Nueva venta" };
export const dynamic = "force-dynamic";

/**
 * Nueva venta.
 *
 * Se ofrecen todos los productos del catálogo, incluidos los borradores: una
 * venta por WhatsApp puede ser de algo que todavía no está publicado en la
 * tienda. Lo que sí se respeta es el stock, y de eso se encarga la base.
 */
export default async function NuevaVentaPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading eyebrow="Ventas · Pedidos" title="Nueva venta" />
        <SupabaseSetupNotice what="Registrar ventas" />
      </>
    );
  }

  const products = await listProducts();

  const options: ProductOption[] = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <>
      <PageHeading
        eyebrow="Ventas · Pedidos"
        title="Nueva venta"
        description="Registra una venta que ya ocurrió: por WhatsApp, en persona o por redes. Al guardar se descuenta el stock de cada producto."
      />
      <SaleForm products={options} />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/config/site";
import { getCatalog, getCatalogFacets } from "@/services/catalog";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Todo el catálogo de Lo Más Cute: maquillaje, skincare, accesorios, perfumes y regalos. Filtra por categoría, precio y tipo de producto. Envíos en Medellín.",
  alternates: { canonical: "/tienda" },
  openGraph: {
    title: `Tienda · ${site.name}`,
    description:
      "Maquillaje, skincare, accesorios, perfumes y regalos elegidos con cariño. Envíos en Medellín en 24 a 48 horas.",
    url: "/tienda",
  },
};

export const revalidate = 60;

export default async function ShopPage() {
  const [products, facets] = await Promise.all([getCatalog(), getCatalogFacets()]);

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(products, "Catálogo Lo Más Cute"),
          breadcrumbSchema([
            { name: "Inicio", href: "/" },
            { name: "Tienda", href: "/tienda" },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={`${products.length} productos`}
        title="Toda la tienda,"
        highlight="para perderse un rato"
        description="Usa los filtros para encontrar exactamente lo que buscas, o simplemente baja despacito y déjate sorprender."
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Tienda", href: "/tienda" },
        ]}
      />

      <section className="pb-24 md:pb-32">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopBrowser products={products} facets={facets} />
        </Suspense>
      </section>
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="container-cute">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[2rem] bg-white/55 ring-1 ring-white/70"
          >
            <div className="aspect-4/5 rounded-t-[2rem] bg-cream-deep" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-20 rounded-full bg-rose-mist" />
              <div className="h-5 w-3/4 rounded-full bg-rose-mist" />
              <div className="h-4 w-1/2 rounded-full bg-rose-mist" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

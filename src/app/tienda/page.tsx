import type { Metadata } from "next";
import { Suspense } from "react";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { getCatalog, getCatalogFacets, getCategories } from "@/services/catalog";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";

/** El texto del catálogo se arma con la configuración, no con un ejemplo. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);
  const description =
    settings.storeDescription ||
    `Todo el catálogo de ${name}. Filtra por categoría, precio y tipo de producto.`;

  return {
    title: "Tienda",
    description,
    alternates: { canonical: "/tienda" },
    openGraph: {
      title: `Tienda · ${name}`,
      description,
      url: "/tienda",
    },
  };
}

export const revalidate = 60;

export default async function ShopPage() {
  const [products, facets, categories, settings] = await Promise.all([
    getCatalog(),
    getCatalogFacets(),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(products, `Catálogo ${storeLabel(settings)}`),
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
          <ShopBrowser products={products} facets={facets} categories={categories} />
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

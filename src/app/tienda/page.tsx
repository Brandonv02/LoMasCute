import type { Metadata } from "next";
import { Suspense } from "react";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { getCatalog, getCatalogFacets, getCategories } from "@/services/catalog";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import { ShopFiltersSkeleton, SkeletonRegion } from "@/components/ui/skeleton";

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
        {/* El explorador suspende en el servidor (lee la URL), así que este
            bloque viaja ya escrito en el HTML y es el skeleton que se ve.
            `count` es el del catálogo real: reserva su alto exacto para que al
            aparecer los productos la página no cambie de tamaño. Por eso esta
            ruta no lleva `loading.tsx`: un skeleton de alto fijo encima de este
            obligaba al documento a crecer de golpe al relevarse. */}
        <Suspense
          fallback={
            <SkeletonRegion className="container-cute" label="Cargando la tienda">
              <ShopFiltersSkeleton count={products.length} />
            </SkeletonRegion>
          }
        >
          <ShopBrowser products={products} facets={facets} categories={categories} />
        </Suspense>
      </section>
    </>
  );
}

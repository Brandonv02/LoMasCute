import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import {
  getCategories,
  getCategory,
  getProductsByCategory,
  getCatalogFacets,
} from "@/services/catalog";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { Reveal } from "@/components/motion/reveal";
import { EmptyCatalog } from "@/components/sections/empty-catalog";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/lib/seo";
import type { CategorySlug } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    getCategory(slug),
    getSiteSettings(),
  ]);
  if (!category) return { title: "Categoría no encontrada" };

  // La promesa de envío solo se menciona si está configurada en el panel.
  const shipping = [
    settings.shippingZone && `Envíos en ${settings.shippingZone}`,
    settings.deliveryTime && `en ${settings.deliveryTime}`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: category.name,
    description: shipping
      ? `${category.description} ${shipping}.`
      : category.description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.name} · ${storeLabel(settings)}`,
      description: category.description,
      url: `/categoria/${category.slug}`,
      images: [{ url: category.image, width: 900, height: 1100, alt: category.name }],
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [items, facets, categories] = await Promise.all([
    getProductsByCategory(category.slug),
    getCatalogFacets(),
    getCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(items, category.name),
          breadcrumbSchema([
            { name: "Inicio", href: "/" },
            { name: "Tienda", href: "/tienda" },
            { name: category.name, href: `/categoria/${category.slug}` },
          ]),
        ]}
      />

      <PageHeader
        eyebrow={category.claim}
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Tienda", href: "/tienda" },
          { name: category.name, href: `/categoria/${category.slug}` },
        ]}
      >
        <Reveal kind="blur" delay={0.2} className="mt-10">
          <div className="relative aspect-16/9 overflow-hidden rounded-[2.5rem] shadow-soft ring-1 ring-white/70 md:aspect-21/9">
            <Image
              src={category.image}
              alt={`Productos de ${category.name} en Lo Más Cute`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 84rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cream/85 via-transparent to-transparent" />
            <ul className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-6 md:p-8">
              {category.subcategories.map((sub) => (
                <li
                  key={sub}
                  className="rounded-full bg-white/85 px-4 py-1.5 text-sm text-ink shadow-petal backdrop-blur-md"
                >
                  {sub}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </PageHeader>

      <section className="pb-24 md:pb-32">
        {items.length === 0 ? (
          <ComingSoon name={category.name} />
        ) : (
          <Suspense fallback={null}>
            <ShopBrowser
              facets={facets}
              products={items}
              categories={categories}
              lockedCategory={category.slug as CategorySlug}
            />
          </Suspense>
        )}
      </section>
    </>
  );
}

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="container-cute">
      <Reveal kind="blur">
        <div className="rounded-[2.5rem] bg-white/62 p-12 text-center ring-1 ring-white/75 backdrop-blur-md md:p-20">
          <p className="text-5xl" aria-hidden>
            🎀
          </p>
          <h2 className="mt-6 font-display text-3xl text-ink md:text-4xl">
            {name} llega muy pronto
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
            Ya estamos eligiendo cada producto con lupa. Déjanos tu correo en el
            Club Cute y serás de las primeras en saber cuando abra.
          </p>
          <a
            href="#club-cute"
            className="mt-8 inline-block rounded-full bg-gradient-to-br from-rose-soft via-rose to-lavender px-8 py-3.5 font-display text-ink shadow-soft transition-transform duration-500 hover:-translate-y-1"
          >
            Avísame cuando esté
          </a>
        </div>
      </Reveal>
    </div>
  );
}

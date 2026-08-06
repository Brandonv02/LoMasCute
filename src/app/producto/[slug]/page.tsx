import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getCatalog,
  getCategory,
  getProduct,
  getRelatedProducts,
} from "@/services/catalog";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { Faq } from "@/components/sections/faq";
import { PetalDivider } from "@/components/atmosphere/ambient";
import { JsonLd, breadcrumbSchema, faqSchema, productSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSiteSettings()]);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.name;
  const description = `${product.description.slice(0, 155)}…`;
  const name = storeLabel(settings);

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} · ${name}`,
      description,
      url: `/producto/${product.slug}`,
      images: [
        { url: product.images[0], width: 1000, height: 1250, alt: product.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${name}`,
      description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [category, related, settings] = await Promise.all([
    getCategory(product.category),
    getRelatedProducts(product.slug, 8),
    getSiteSettings(),
  ]);
  // Solo las preguntas cargadas en la ficha; sin ellas la sección no aparece.
  const faqs = product.faqs ?? [];

  const crumbs = [
    { name: "Inicio", href: "/" },
    { name: "Tienda", href: "/tienda" },
    ...(category
      ? [{ name: category.name, href: `/categoria/${category.slug}` }]
      : []),
    { name: product.name, href: `/producto/${product.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          productSchema(product, settings),
          breadcrumbSchema(crumbs),
          ...(faqs.length ? [faqSchema(faqs)] : []),
        ]}
      />

      {/* Miga de pan */}
      <div className="container-cute pb-8 pt-10">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1">
                  {last ? (
                    <span aria-current="page" className="truncate text-ink">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={crumb.href}
                        className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                      >
                        {crumb.name}
                      </Link>
                      <ChevronRight
                        aria-hidden
                        className="size-3.5 shrink-0 text-ink-muted"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <section className="pb-20">
        <ProductDetail product={product} />
      </section>

      <PetalDivider />

      {/* Relacionados */}
      <section className="py-20 md:py-24">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Va bien con esto"
            title="También te puede"
            highlight="encantar"
            link={{ href: "/tienda", label: "Ver toda la tienda" }}
          />
          <div className="mt-12">
            <ProductRail products={related} />
          </div>
        </div>
      </section>

      <Faq
        faqs={faqs}
        eyebrow="Preguntas frecuentes"
        title="Dudas sobre"
        highlight="este producto"
      />
    </>
  );
}

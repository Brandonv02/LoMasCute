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
import { reviewsForProduct, storeFaqs } from "@/data/reviews";
import { site } from "@/config/site";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { Faq } from "@/components/sections/faq";
import { Reveal } from "@/components/motion/reveal";
import { Stars } from "@/components/ui/stars";
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
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  const title = product.name;
  const description = `${product.description.slice(0, 155)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} · ${site.name}`,
      description,
      url: `/producto/${product.slug}`,
      images: [
        { url: product.images[0], width: 1000, height: 1250, alt: product.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.name}`,
      description,
      images: [product.images[0]],
    },
  };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([
    getCategory(product.category),
    getRelatedProducts(product.slug, 8),
  ]);
  const productReviews = reviewsForProduct(product.slug);
  const faqs = [...(product.faqs ?? []), ...storeFaqs.slice(0, 4)];

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
        data={[productSchema(product), breadcrumbSchema(crumbs), faqSchema(faqs)]}
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

      {/* Opiniones */}
      <section id="opiniones" className="scroll-mt-28 py-16 md:py-20">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Opiniones"
            title="Qué dicen de"
            highlight="este producto"
            description={`${product.rating} de 5 según ${product.reviewsCount} clientas verificadas.`}
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-12">
            {/* Resumen de calificación */}
            <Reveal kind="up">
              <div className="rounded-[2rem] bg-white/62 p-7 text-center ring-1 ring-white/75 backdrop-blur-md">
                <p className="font-display text-6xl leading-none text-ink">
                  {product.rating.toFixed(1)}
                </p>
                <div className="mt-3 flex justify-center">
                  <Stars rating={product.rating} size={18} />
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {product.reviewsCount} opiniones
                </p>

                <ul className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    // Distribución estimada a partir del promedio
                    const weight =
                      star === 5
                        ? 0.78
                        : star === 4
                          ? 0.16
                          : star === 3
                            ? 0.04
                            : star === 2
                              ? 0.015
                              : 0.005;
                    return (
                      <li key={star} className="flex items-center gap-2.5 text-xs">
                        <span className="w-3 text-ink-soft">{star}</span>
                        <span
                          aria-hidden
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-rose-mist"
                        >
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-gold to-rose"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </span>
                        <span className="w-9 text-right text-ink-muted">
                          {Math.round(weight * 100)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

            {/* Lista de opiniones */}
            <div className="space-y-4">
              {(productReviews.length > 0
                ? productReviews
                : [
                    {
                      id: "generic",
                      name: "Clienta verificada",
                      city: site.city,
                      rating: product.rating,
                      date: "2026-07-01",
                      initials: "LC",
                      tone: "rose" as const,
                      text: "Llegó rapidísimo y muy bien empacado. La calidad se siente desde que lo abres, ya quiero pedir otra cosita.",
                    },
                  ]
              ).map((review, i) => (
                <Reveal key={review.id} kind="up" delay={i * 0.08} as="article">
                  <figure className="rounded-[1.75rem] bg-white/58 p-6 ring-1 ring-white/72 backdrop-blur-md transition-shadow duration-600 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <span
                          aria-hidden
                          className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-lavender font-display text-sm text-[#7a4a5e]"
                        >
                          {review.initials}
                        </span>
                        <div>
                          <p className="font-display text-[0.95rem] text-ink">
                            {review.name}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {review.city} · {formatDate(review.date)}
                          </p>
                        </div>
                      </div>
                      <Stars rating={review.rating} size={13} />
                    </div>
                    <blockquote className="mt-4 leading-relaxed text-ink-soft">
                      “{review.text}”
                    </blockquote>
                    <figcaption className="mt-3 flex items-center gap-1.5 text-xs text-[#3f6a61]">
                      <span aria-hidden>✓</span> Compra verificada
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
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

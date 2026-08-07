import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { storeLabel } from "@/lib/site-settings";
import {
  getBestsellers,
  getCatalog,
  getCategories,
  getFavorites,
  getNewArrivals,
} from "@/services/catalog";
import { getSiteSettings } from "@/services/site-settings";
import { Hero } from "@/components/sections/hero";
import { CategoriesGrid } from "@/components/sections/categories-grid";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { WhyUs } from "@/components/sections/why-us";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { SocialFeeds } from "@/components/sections/social-feeds";
import { Reveal } from "@/components/motion/reveal";
import { PetalDivider } from "@/components/atmosphere/ambient";
import { Button } from "@/components/ui/button";
import { Faq } from "@/components/sections/faq";
import { JsonLd, itemListSchema } from "@/lib/seo";

/**
 * Portada.
 *
 * Regla de la página: **no se pinta nada que no tenga un dato real detrás.**
 * Los textos de marca vienen de `site_settings` (panel → Configuración) y los
 * productos de `products`. Cada sección decide sola si aparece; ninguna
 * enseña ejemplos, ni placeholders, ni cifras de mentira.
 */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);

  return {
    title: settings.heroTitle ? `${name} — ${settings.heroTitle}` : name,
    description: settings.storeDescription || undefined,
    alternates: { canonical: "/" },
  };
}

// El catálogo y la configuración viven en Supabase; se revalida cada minuto
// para que la portada siga sirviéndose como HTML estático entre cambios.
export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, bestsellers, newArrivals, favorites, products] =
    await Promise.all([
      getSiteSettings(),
      getCategories(),
      getBestsellers(),
      getNewArrivals(),
      getFavorites(),
      getCatalog(),
    ]);

  return (
    <>
      {bestsellers.length > 0 && (
        <JsonLd data={itemListSchema(bestsellers, "Los más amados")} />
      )}

      <Hero settings={settings} hasCategories={categories.length > 0} />

      <CategoriesGrid />

      {/* Productos destacados */}
      {bestsellers.length > 0 && (
        <section className="relative py-24 md:py-28" aria-labelledby="destacados">
          <div className="container-cute">
            <SectionHeading
              eyebrow="Productos destacados"
              title="Los que todas"
              highlight="piden dos veces"
              link={{ href: "/tienda", label: "Ver todos" }}
            />
            <div className="mt-14">
              <ProductRail products={bestsellers} priority />
            </div>
          </div>
        </section>
      )}

      {/* Lo nuevo */}
      {newArrivals.length > 0 && (
        <section className="relative py-24 md:py-28" aria-labelledby="nuevo">
          <div className="container-cute">
            <SectionHeading
              eyebrow="Lo nuevo"
              title="Recién llegado"
              highlight="al catálogo"
              link={{ href: "/tienda?orden=nuevo", label: "Ver lo nuevo" }}
            />
            <div className="mt-14">
              <ProductRail products={newArrivals} />
            </div>
          </div>
        </section>
      )}

      <WhyUs settings={settings} />

      {/* Los favoritos */}
      {favorites.length > 0 && (
        <section className="relative py-24 md:py-28" aria-labelledby="favoritos">
          <div className="container-cute">
            <SectionHeading
              eyebrow="Los favoritos"
              title="Amados por"
              highlight="nuestras clientas"
              link={{ href: "/tienda?orden=favoritos", label: "Ver favoritos" }}
            />
            <div className="mt-14">
              <ProductRail products={favorites} />
            </div>
          </div>
        </section>
      )}

      {/* Reseñas: sin fuente real todavía, así que no se pinta */}
      <ReviewsSection />

      <SocialFeeds settings={settings} />

      {/* Preguntas frecuentes: pendientes de cargarse en el panel */}
      <Faq faqs={[]} title="Todo lo que" highlight="quieres saber" />

      {/* Cierre */}
      {products.length > 0 && (
        <section className="relative py-16 md:py-24">
          <div className="container-cute">
            <Reveal kind="blur">
              <div className="grain relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-rose-mist via-white/70 to-lavender-soft p-10 text-center shadow-soft ring-1 ring-white/80 md:p-20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 -top-16 size-72 animate-drift decor-loop rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_66%)] blur-2xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-20 -right-10 size-80 animate-drift decor-loop rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.45),transparent_66%)] blur-2xl [animation-delay:-9s]"
                />

                <PetalDivider className="mb-6" />

                <h2 className="relative font-display text-[2.1rem] leading-[1.08] md:text-[3.2rem]">
                  ¿Lista para consentirte{" "}
                  <span className="text-gradient">un poquito?</span>
                </h2>
                <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                  {products.length}{" "}
                  {products.length === 1 ? "producto disponible" : "productos disponibles"}
                  {settings.deliveryTime && ` · entrega en ${settings.deliveryTime}`}
                  {settings.shippingText && `. ${settings.shippingText}`}
                </p>

                <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="xl">
                    <Link href="/tienda">
                      Empezar a comprar
                      <ArrowRight
                        className="size-4.5 transition-transform duration-500 group-hover:translate-x-1"
                        strokeWidth={2}
                      />
                    </Link>
                  </Button>
                  <Button asChild size="xl" variant="outline">
                    <Link href="/nosotros">Conocer la marca</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}

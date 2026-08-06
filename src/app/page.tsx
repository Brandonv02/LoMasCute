import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import {
  getBestsellers,
  getCatalog,
  getFavorites,
  getNewArrivals,
} from "@/services/catalog";
import { storeFaqs } from "@/data/reviews";
import { Hero } from "@/components/sections/hero";
import { CategoriesGrid } from "@/components/sections/categories-grid";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { WhyUs } from "@/components/sections/why-us";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { SocialFeeds } from "@/components/sections/social-feeds";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { PetalDivider } from "@/components/atmosphere/ambient";
import { Button } from "@/components/ui/button";
import { Faq } from "@/components/sections/faq";
import { EmptyCatalog } from "@/components/sections/empty-catalog";
import { JsonLd, faqSchema, itemListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

// El catálogo vive en Supabase; se revalida cada minuto para que la portada
// siga sirviéndose como HTML estático entre cambios.
export const revalidate = 60;

export default async function HomePage() {
  const [bestsellers, newArrivals, favorites, products] = await Promise.all([
    getBestsellers(),
    getNewArrivals(),
    getFavorites(),
    getCatalog(),
  ]);

  return (
    <>
      <JsonLd data={[faqSchema(), itemListSchema(bestsellers, "Los más amados")]} />

      <Hero />

      <CategoriesGrid />

      {/* Productos destacados */}
      <section className="relative py-24 md:py-28" aria-labelledby="destacados">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Productos destacados"
            title="Los que todas"
            highlight="piden dos veces"
            description="Nuestros más vendidos, esos que se agotan y volvemos a traer porque nos los piden por WhatsApp."
            link={{ href: "/tienda", label: "Ver todos" }}
          />
          <div className="mt-14">
            {bestsellers.length ? (
              <ProductRail products={bestsellers} priority />
            ) : (
              <EmptyCatalog
                compact
                title="Todavía no hay destacados"
                description="En cuanto marquemos los primeros favoritos del equipo, aparecerán aquí."
                action={{ href: "/tienda", label: "Ver toda la tienda" }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Franja editorial de marca */}
      <BrandStrip />

      {/* Lo nuevo */}
      <section className="relative py-24 md:py-28" aria-labelledby="nuevo">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Lo nuevo"
            title="Recién llegado"
            highlight="al taller"
            description="Lo que acabamos de sumar al catálogo. Suele durar poquito."
            link={{ href: "/tienda?orden=nuevo", label: "Ver lo nuevo" }}
          />
          <div className="mt-14">
            {newArrivals.length ? (
              <ProductRail products={newArrivals} />
            ) : (
              <EmptyCatalog
                compact
                title="Nada nuevo por ahora"
                description="Estamos preparando el próximo lanzamiento. Vuelve en unos días."
                action={{ href: "/tienda", label: "Ver toda la tienda" }}
              />
            )}
          </div>
        </div>
      </section>

      <WhyUs />

      {/* Los favoritos */}
      <section className="relative py-24 md:py-28" aria-labelledby="favoritos">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Los favoritos"
            title="Amados por"
            highlight="nuestras clientas"
            description="Los productos con mejor calificación y las reseñas más lindas."
            link={{ href: "/tienda?orden=favoritos", label: "Ver favoritos" }}
          />
          <div className="mt-14">
            {favorites.length ? (
              <ProductRail products={favorites} />
            ) : (
              <EmptyCatalog
                compact
                title="Aún sin favoritos"
                description="Cuando las reseñas empiecen a llegar, los mejor calificados vivirán aquí."
                action={{ href: "/tienda", label: "Ver toda la tienda" }}
              />
            )}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <SocialFeeds />

      <Faq
        faqs={storeFaqs}
        eyebrow="Preguntas frecuentes"
        title="Todo lo que"
        highlight="quieres saber"
      />

      {/* Cierre */}
      <section className="relative py-16 md:py-24">
        <div className="container-cute">
          <Reveal kind="blur">
            <div className="grain relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-rose-mist via-white/70 to-lavender-soft p-10 text-center shadow-soft ring-1 ring-white/80 md:p-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 size-72 animate-drift rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_66%)] blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -right-10 size-80 animate-drift rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.45),transparent_66%)] blur-2xl [animation-delay:-9s]"
              />

              <PetalDivider className="mb-6" />

              <h2 className="relative font-display text-[2.1rem] leading-[1.08] md:text-[3.2rem]">
                ¿Lista para consentirte{" "}
                <span className="text-gradient">un poquito?</span>
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                {products.length} productos elegidos con calma, envueltos a mano y
                entregados en 24 a 48 horas en Medellín.
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
    </>
  );
}

/** Franja editorial: refuerza que la marca es lifestyle, no solo maquillaje */
function BrandStrip() {
  const pillars = [
    {
      title: "Curado, no surtido",
      text: "Probamos cada producto antes de traerlo. Si no lo usaríamos nosotras, no entra.",
    },
    {
      title: "Empaque que se guarda",
      text: "Cajas y bolsas tan lindas que la gente las reutiliza. Eso también es diseño.",
    },
    {
      title: "Una marca que crece",
      text: "Hoy maquillaje y skincare. Mañana papelería, decoración y todo lo cute.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container-cute">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Parallax speed={40}>
            <div className="relative">
              <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem] shadow-float ring-1 ring-white/70 sm:aspect-16/12">
                <Image
                  src="/art/editorial-a.svg"
                  alt="Productos de Lo Más Cute en composición editorial pastel"
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 92vw, 44rem"
                  className="object-cover"
                />
              </div>
              <div className="glass absolute -bottom-6 left-6 rounded-3xl px-5 py-4">
                <p className="font-display text-2xl text-ink">100%</p>
                <p className="text-xs text-ink-soft">productos originales</p>
              </div>
            </div>
          </Parallax>

          <div>
            <SectionHeading
              eyebrow="Nuestra manera"
              title="Una tienda pequeña con"
              highlight="obsesión por el detalle"
              description="Lo Más Cute nació en Medellín con una idea simple: que comprarte algo lindo sea, en sí mismo, un momento lindo."
            />

            <ul className="mt-10 space-y-4">
              {pillars.map((pillar, i) => (
                <Reveal key={pillar.title} kind="left" delay={i * 0.1} as="li">
                  <div className="flex gap-4 rounded-3xl bg-white/58 p-5 ring-1 ring-white/72 backdrop-blur-md transition-all duration-600 hover:bg-white/78 hover:shadow-soft">
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-lavender font-display text-sm text-[#7a4a5e]"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-ink">{pillar.title}</h3>
                      <p className="mt-1 leading-relaxed text-ink-soft">{pillar.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal kind="up" delay={0.34} className="mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/nosotros">
                  Leer nuestra historia
                  <ArrowRight
                    className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

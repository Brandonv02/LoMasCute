import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories, comingCategories } from "@/data/categories";
import { productsByCategory } from "@/data/products";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn, pluralize } from "@/lib/utils";

const toneRing: Record<string, string> = {
  rose: "from-rose-mist/90 to-rose-soft/60",
  mint: "from-mint-soft/90 to-mint/50",
  lavender: "from-lavender-soft/90 to-lavender/55",
  peach: "from-peach-soft/90 to-peach/60",
  gold: "from-gold-soft/90 to-gold/55",
};

/**
 * Vitrina de categorías. La primera es más grande porque hoy es el corazón
 * del catálogo, pero la retícula ya está pensada para cuando todas tengan
 * el mismo peso.
 */
export function CategoriesGrid() {
  return (
    <section id="categorias" className="relative scroll-mt-28 py-24 md:py-32">
      <div className="container-cute">
        <SectionHeading
          eyebrow="Nuestras categorías"
          title="Todo lo lindo,"
          highlight="ordenadito"
          description="Empezamos con maquillaje, skincare y accesorios. Cada mes entra algo nuevo, así que este espacio va a seguir creciendo."
          link={{ href: "/tienda", label: "Ver toda la tienda" }}
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {categories.map((cat, index) => {
            const count = productsByCategory(cat.slug).length;
            const featured = index === 0;
            return (
              <StaggerItem
                key={cat.slug}
                as="article"
                className={cn(featured && "sm:col-span-2 lg:row-span-2")}
              >
                <Link
                  href={cat.comingSoon ? "/tienda" : `/categoria/${cat.slug}`}
                  className={cn(
                    "card-lift group relative flex h-full flex-col justify-end overflow-hidden rounded-[2.25rem] ring-1 ring-white/75",
                    featured ? "min-h-[26rem] lg:min-h-[34rem]" : "min-h-[15rem]",
                  )}
                >
                  {/* Arte */}
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    sizes={featured ? "(max-width: 1024px) 100vw, 45vw" : "(max-width: 640px) 100vw, 30vw"}
                    className="object-cover transition-transform duration-[1300ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
                  />

                  {/* Velo pastel para asegurar contraste del texto */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t opacity-95 transition-opacity duration-700 group-hover:opacity-100",
                      toneRing[cat.tone],
                    )}
                    style={{
                      background:
                        "linear-gradient(to top, rgba(255,247,244,0.97) 6%, rgba(255,247,244,0.82) 32%, rgba(255,247,244,0.18) 62%, transparent 100%)",
                    }}
                  />

                  {/* Contenido */}
                  <div className="relative z-10 p-6 md:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className={cn(
                            "font-display leading-tight text-ink",
                            featured ? "text-3xl md:text-[2.5rem]" : "text-2xl",
                          )}
                        >
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-sm text-ink-soft">{cat.claim}</p>
                      </div>
                      <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-white/85 text-ink shadow-petal transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-45">
                        <ArrowUpRight className="size-4" strokeWidth={2} />
                      </span>
                    </div>

                    {featured && (
                      <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
                        {cat.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {cat.comingSoon ? (
                        <span className="rounded-full bg-white/85 px-3 py-1 font-display text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft ring-1 ring-white/80">
                          Muy pronto
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/85 px-3 py-1 font-display text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft ring-1 ring-white/80">
                          {count} {pluralize(count, "producto", "productos")}
                        </span>
                      )}
                      {cat.subcategories.slice(0, featured ? 4 : 2).map((sub) => (
                        <span
                          key={sub}
                          className="rounded-full bg-white/55 px-3 py-1 text-[0.7rem] text-ink-soft"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Lo que viene: la marca ya se anuncia como lifestyle */}
        <Reveal kind="up" delay={0.1} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2.25rem] bg-white/60 p-7 ring-1 ring-white/75 backdrop-blur-md md:p-9">
            <div>
              <h3 className="font-display text-xl text-ink">
                Y esto es solo el comienzo ✨
              </h3>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-soft">
                Lo Más Cute no es una tienda de maquillaje: es una tienda de cosas
                lindas. Estas categorías ya están en camino.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {comingCategories.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm text-ink-soft ring-1 ring-rose/20 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-petal"
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

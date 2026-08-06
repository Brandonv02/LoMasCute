import { Quote } from "lucide-react";
import { reviews, ratingSummary } from "@/data/reviews";
import { getProduct } from "@/services/catalog";
import { SectionHeading } from "@/components/sections/section-heading";
import { ReviewsCarousel } from "@/components/sections/reviews-carousel";
import { Stars } from "@/components/ui/stars";
import { Reveal } from "@/components/motion/reveal";

const avatarTones: Record<string, string> = {
  rose: "bg-gradient-to-br from-rose-soft to-rose text-[#8a4c62]",
  mint: "bg-gradient-to-br from-mint-soft to-mint text-[#3f6a61]",
  lavender: "bg-gradient-to-br from-lavender-soft to-lavender text-[#5e4b86]",
  peach: "bg-gradient-to-br from-peach-soft to-peach text-[#8a5b3f]",
  gold: "bg-gradient-to-br from-gold-soft to-gold text-[#7c6023]",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

/**
 * Server Component: las tarjetas se arman en el servidor y solo el riel es
 * cliente. Antes esta sección era "use client" entera, lo que arrastraba al
 * navegador el catálogo completo de productos (lo pide `productBySlug`) para
 * imprimir una línea de texto por reseña.
 */
export async function ReviewsSection() {
  // El nombre del producto comprado sale del catálogo real.
  const bought = await Promise.all(
    reviews.map((review) =>
      review.productSlug ? getProduct(review.productSlug) : undefined,
    ),
  );

  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-labelledby="reseñas">
      <div className="container-cute">
        <SectionHeading
          eyebrow="Lo que dicen"
          title="Reseñas de gente"
          highlight="de verdad"
          description={`${ratingSummary.average} de 5 en promedio, con ${ratingSummary.count.toLocaleString("es-CO")} pedidos entregados en Medellín y alrededores.`}
          link={{ href: "/tienda", label: "Comprar lo más amado" }}
        />

        <Reveal kind="blur" delay={0.1} className="mt-14">
          <ReviewsCarousel>
            {reviews.map((review, index) => {
              const product = bought[index];
              return (
                <figure
                  key={review.id}
                  className="card-lift relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/68 p-7 ring-1 ring-white/78 backdrop-blur-md"
                >
                  <Quote
                    aria-hidden
                    className="absolute right-5 top-5 size-10 text-rose/25"
                    strokeWidth={1.5}
                  />

                  <Stars rating={review.rating} size={15} />

                  <blockquote className="mt-4 flex-1 leading-relaxed text-ink">
                    “{review.text}”
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3.5">
                    <span
                      aria-hidden
                      className={`grid size-12 shrink-0 place-items-center rounded-full font-display text-sm shadow-petal ${avatarTones[review.tone]}`}
                    >
                      {review.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[0.95rem] text-ink">
                        {review.name}
                      </span>
                      <span className="block truncate text-sm text-ink-soft">
                        {review.city} · {formatDate(review.date)}
                      </span>
                    </span>
                  </figcaption>

                  {product && (
                    <p className="mt-4 truncate rounded-full bg-cream px-3.5 py-1.5 text-xs text-ink-soft ring-1 ring-rose/20">
                      Compró: {product.name}
                    </p>
                  )}
                </figure>
              );
            })}
          </ReviewsCarousel>
        </Reveal>
      </div>
    </section>
  );
}

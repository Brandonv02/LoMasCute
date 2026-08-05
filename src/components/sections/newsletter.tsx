import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Twinkles } from "@/components/atmosphere/ambient";
import { NewsletterForm } from "@/components/sections/newsletter-form";

/**
 * Club Cute. Va dentro del footer, es decir, en todas las páginas: por eso
 * ahora todo el bloque es servidor y solo el formulario es cliente.
 */
export function Newsletter() {
  return (
    <Reveal kind="blur" className="relative scroll-mt-28" id="club-cute">
      <div className="grain relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/80 via-rose-mist/70 to-lavender-soft/70 p-8 shadow-soft ring-1 ring-white/80 backdrop-blur-xl md:p-14">
        <Twinkles count={10} />

        {/* Manchas de luz */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-64 animate-drift rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_68%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 size-72 animate-drift rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.45),transparent_68%)] blur-2xl [animation-delay:-8s]"
        />

        <div className="relative grid items-center gap-9 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-ink-soft shadow-petal">
              <Sparkles className="size-3.5 text-gold" strokeWidth={2} />
              Club Cute
            </span>
            <h2 className="mt-5 font-display text-3xl leading-[1.1] text-ink md:text-[2.6rem]">
              Entérate primero de{" "}
              <span className="text-gradient">lo nuevo y lo lindo</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
              Lanzamientos, restocks y un cupón de bienvenida del 10%. Escribimos
              poquito y solo cuando vale la pena.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              {["10% en tu primera compra", "Acceso anticipado", "Sin spam, prometido"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-rose">
                      ♡
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <NewsletterForm />
        </div>
      </div>
    </Reveal>
  );
}

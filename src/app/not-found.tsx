import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";
import { getBestsellers } from "@/services/catalog";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Twinkles } from "@/components/atmosphere/ambient";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const bestsellers = await getBestsellers();

  return (
    <>
      <section className="relative overflow-hidden py-24 md:py-32">
        <Twinkles count={14} />
        <div className="container-cute">
          <Reveal kind="blur">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="font-display text-[6rem] leading-none text-gradient md:text-[9rem]"
                aria-hidden
              >
                404
              </p>
              <h1 className="mt-2 font-display text-[2rem] leading-tight md:text-[2.8rem]">
                Esta página se nos{" "}
                <span className="text-gradient">perdió en el taller</span>
              </h1>
              <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink-soft">
                Puede que el enlace haya cambiado o que el producto ya no esté
                disponible. Pero tranquila, tenemos muchas otras cosas lindas.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/">
                    <Home className="size-4.5" strokeWidth={1.9} />
                    Volver al inicio
                  </Link>
                </Button>
                <Button asChild size="lg" variant="cream">
                  <Link href="/tienda">
                    <Search className="size-4.5" strokeWidth={1.9} />
                    Buscar en la tienda
                    <ArrowRight
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Mientras estás aquí"
            title="Mira lo que"
            highlight="más se lleva la gente"
            align="center"
          />
          <div className="mt-12">
            <ProductRail products={bestsellers} />
          </div>
        </div>
      </section>
    </>
  );
}

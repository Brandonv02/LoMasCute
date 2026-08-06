import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Sparkles, Users } from "lucide-react";
import { storeLabel } from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Parallax, Tilt } from "@/components/motion/parallax";
import { PetalDivider, Twinkles } from "@/components/atmosphere/ambient";
import { Button } from "@/components/ui/button";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

/**
 * Página "Nosotros".
 *
 * Solo contenido atemporal: quiénes somos, misión, visión y valores. Nada de
 * cifras, hitos ni equipo, porque no hay un dato real que los sostenga y una
 * cifra inventada es peor que no decir nada. El nombre y la descripción salen
 * de `site_settings` cuando estén configurados.
 */

const values = [
  {
    icon: Sparkles,
    title: "Productos originales",
    text: "Trabajamos con marcas y distribuidores autorizados. Lo que recibes es exactamente lo que compraste, sellado y en buen estado.",
    tone: "bg-gold-soft text-[#7c6023]",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    text: "Te responde una persona que conoce lo que vendemos y te ayuda a elegir. Sin respuestas automáticas ni plantillas.",
    tone: "bg-lavender-soft text-[#5e4b86]",
  },
  {
    icon: Heart,
    title: "Confianza y calidad",
    text: "Describimos cada producto como es, sin exagerar. Si algo llega mal, lo resolvemos: nos importa más que vuelvas que una venta suelta.",
    tone: "bg-rose-mist text-[#a8556f]",
  },
  {
    icon: Leaf,
    title: "Cuidado en el detalle",
    text: "Elegimos con criterio y preparamos cada pedido con calma, para que abrirlo también se sienta lindo.",
    tone: "bg-mint-soft text-[#3f6a61]",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);
  const description =
    settings.storeDescription ||
    `Quiénes somos en ${name}: nuestra misión, nuestra visión y los valores con los que elegimos cada producto y atendemos a cada persona.`;

  return {
    title: "Nosotros",
    description,
    alternates: { canonical: "/nosotros" },
    openGraph: {
      title: `Nosotros · ${name}`,
      description,
      url: "/nosotros",
    },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);

  const intro =
    settings.storeDescription ||
    `${name} es una tienda de cosas lindas. Elegimos productos originales uno por uno, los explicamos con honestidad y acompañamos a cada persona que nos escribe hasta que su pedido llega a sus manos.`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", href: "/" },
          { name: "Nosotros", href: "/nosotros" },
        ])}
      />

      <PageHeader
        eyebrow="Quiénes somos"
        title="Cosas lindas,"
        highlight="elegidas con cuidado"
        description={intro}
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Nosotros", href: "/nosotros" },
        ]}
      />

      {/* Imágenes de marca */}
      <section className="py-12 md:py-16">
        <div className="container-cute">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { src: "/art/editorial-a.svg", alt: `Composición de productos de ${name} en tonos pastel`, tall: true },
              { src: "/art/editorial-b.svg", alt: `Productos de ${name} sobre un fondo menta` },
              { src: "/art/editorial-c.svg", alt: `Detalle de productos de ${name} en tonos lavanda` },
            ].map((photo, i) => (
              <Reveal key={photo.src} kind="blur" delay={i * 0.12}>
                <Parallax speed={i === 1 ? 46 : 24}>
                  <Tilt max={7}>
                    <div
                      className={`relative overflow-hidden rounded-[2.25rem] shadow-soft ring-1 ring-white/72 ${
                        photo.tall ? "aspect-4/5" : "aspect-square"
                      } ${i === 1 ? "md:mt-12" : ""}`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        loading={i === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 92vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                  </Tilt>
                </Parallax>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="py-20 md:py-28">
        <div className="container-cute">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal kind="left">
              <article className="grain relative h-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-mist via-white/72 to-peach-soft p-9 ring-1 ring-white/78 md:p-12">
                <Twinkles count={7} />
                <p className="font-display text-xs uppercase tracking-[0.22em] text-ink-muted">
                  Misión
                </p>
                <h2 className="mt-4 font-display text-[1.9rem] leading-tight text-ink md:text-4xl">
                  Que comprar algo lindo se sienta cuidado de principio a fin.
                </h2>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Ofrecemos productos originales, los presentamos tal como son y
                  acompañamos cada compra con una atención cercana. Queremos que
                  la confianza sea la razón por la que vuelves, no la casualidad.
                </p>
              </article>
            </Reveal>

            <Reveal kind="right" delay={0.1}>
              <article className="grain relative h-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-mint-soft via-white/72 to-lavender-soft p-9 ring-1 ring-white/78 md:p-12">
                <Twinkles count={7} />
                <p className="font-display text-xs uppercase tracking-[0.22em] text-ink-muted">
                  Visión
                </p>
                <h2 className="mt-4 font-display text-[1.9rem] leading-tight text-ink md:text-4xl">
                  Ser la tienda en la que comprar es sinónimo de confianza.
                </h2>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Queremos crecer sin perder lo que nos define: productos
                  auténticos, precios claros y una atención que trata a cada
                  persona como lo que es, no como un pedido más.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 md:py-20">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Nuestros valores"
            title="Cuatro cosas que"
            highlight="no negociamos"
            align="center"
          />

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {values.map((value) => (
              <StaggerItem key={value.title} as="article">
                <div className="card-lift h-full rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/75 backdrop-blur-md">
                  <span
                    className={`grid size-14 place-items-center rounded-3xl transition-transform duration-600 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)] group-hover:scale-110 ${value.tone}`}
                  >
                    <value.icon className="size-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-ink">{value.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-ink-soft">{value.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <PetalDivider className="my-6" />

      {/* Cierre */}
      <section className="py-16 md:py-24">
        <div className="container-cute">
          <Reveal kind="up">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-lavender-soft via-white/70 to-rose-mist p-10 text-center ring-1 ring-white/78 md:p-16">
              <h2 className="font-display text-[2rem] leading-tight md:text-[2.8rem]">
                ¿Buscas algo lindo?
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                Mira lo que tenemos hoy o escríbenos y te ayudamos a encontrarlo.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button asChild size="xl">
                  <Link href="/tienda">
                    Ver la tienda
                    <ArrowRight
                      className="size-4.5 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="cream">
                  <Link href="/contacto">Escribirnos</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

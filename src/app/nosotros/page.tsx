import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Sparkles, Users } from "lucide-react";
import { site } from "@/config/site";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Parallax, Tilt } from "@/components/motion/parallax";
import { PetalDivider, Twinkles } from "@/components/atmosphere/ambient";
import { Button } from "@/components/ui/button";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "La historia de Lo Más Cute: cómo una tienda pequeña de Medellín se volvió una marca lifestyle. Nuestra misión, visión y los valores que nos guían.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: `Nosotros · ${site.name}`,
    description:
      "Cómo nació Lo Más Cute en Medellín y hacia dónde vamos: de maquillaje a una marca lifestyle completa.",
    url: "/nosotros",
  },
};

const values = [
  {
    icon: Heart,
    title: "Curaduría honesta",
    text: "Probamos todo. Si un producto no nos convence, no entra al catálogo, aunque se venda solo.",
    tone: "bg-rose-mist text-[#a8556f]",
  },
  {
    icon: Sparkles,
    title: "El detalle importa",
    text: "El papel de seda, el sticker, la notica escrita a mano. Eso no es marketing, es cariño.",
    tone: "bg-gold-soft text-[#7c6023]",
  },
  {
    icon: Users,
    title: "Personas, no tickets",
    text: "Quien te responde el WhatsApp es del equipo y conoce los productos. Sin respuestas robot.",
    tone: "bg-lavender-soft text-[#5e4b86]",
  },
  {
    icon: Leaf,
    title: "Crecer despacio y bien",
    text: "Preferimos pocas cosas buenas a un catálogo enorme. Y empaques que se puedan reutilizar.",
    tone: "bg-mint-soft text-[#3f6a61]",
  },
];

const timeline = [
  {
    year: "2023",
    title: "Una caja de zapatos",
    text: "Todo empezó vendiendo labiales entre amigas de la universidad, con el inventario guardado en una caja debajo de la cama.",
  },
  {
    year: "2024",
    title: "El primer taller",
    text: "Alquilamos un espacio chiquito en El Poblado para empacar sin invadir la sala de la casa. Ahí nació la envoltura que hoy nos reconocen.",
  },
  {
    year: "2025",
    title: "Más que maquillaje",
    text: "Sumamos skincare y accesorios porque las clientas nos los pedían. Entendimos que la marca no era de maquillaje: era de cosas lindas.",
  },
  {
    year: "2026",
    title: "Lo Más Cute como marca",
    text: "Rediseñamos la identidad para que quepan la papelería, los perfumes, los regalos y todo lo que viene. Esta tienda es ese siguiente paso.",
  },
];

const stats = [
  { value: "1.284", label: "pedidos entregados" },
  { value: "4.8", label: "calificación promedio" },
  { value: "24 h", label: "tiempo de entrega típico" },
  { value: "100%", label: "envuelto a mano" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", href: "/" },
          { name: "Nosotros", href: "/nosotros" },
        ])}
      />

      <PageHeader
        eyebrow="Nuestra historia"
        title="Empezamos con una caja de labiales"
        highlight="y muchas ganas"
        description={`Lo Más Cute nació en ${site.city} en 2023. Hoy somos un equipo pequeño que elige, prueba y envuelve cada producto que sale de nuestro taller.`}
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Nosotros", href: "/nosotros" },
        ]}
      />

      {/* Fotos + historia */}
      <section className="py-12 md:py-16">
        <div className="container-cute">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { src: "/art/editorial-a.svg", alt: "Rincón del taller de Lo Más Cute con productos pastel", tall: true },
              { src: "/art/editorial-b.svg", alt: "Productos de skincare de Lo Más Cute sobre fondo menta" },
              { src: "/art/editorial-c.svg", alt: "Composición de accesorios en tonos lavanda" },
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
                  Que comprarte algo lindo sea, en sí mismo, un momento lindo.
                </h2>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Elegimos productos que valen lo que cuestan, los explicamos sin
                  exagerar y los entregamos envueltos como si fueran para alguien
                  muy querido. Porque lo son.
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
                  Ser la marca que las colombianas piensan cuando quieren algo
                  bonito.
                </h2>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Hoy maquillaje, skincare y accesorios en Medellín. Mañana
                  papelería, perfumes, decoración y regalos en todo el país. La
                  categoría cambia; la sensación de abrir el paquete, no.
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

      {/* Línea de tiempo */}
      <section className="py-16 md:py-24">
        <div className="container-cute">
          <SectionHeading
            eyebrow="Cómo llegamos aquí"
            title="Cuatro años,"
            highlight="paso a pasito"
          />

          <ol className="relative mt-14 space-y-8 before:absolute before:left-[1.35rem] before:top-3 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-rose before:via-lavender before:to-transparent md:before:left-1/2">
            {timeline.map((item, i) => (
              <Reveal
                key={item.year}
                kind={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.06}
                as="li"
                className="relative pl-14 md:w-1/2 md:pl-0 md:odd:pr-14 md:even:ml-auto md:even:pl-14"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 grid size-11 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-lavender font-display text-xs text-[#7a4a5e] shadow-petal md:left-auto md:odd:-right-[1.35rem] md:even:-left-[1.35rem]"
                >
                  {item.year}
                </span>
                <div className="rounded-[1.75rem] bg-white/62 p-6 ring-1 ring-white/75 backdrop-blur-md transition-shadow duration-600 hover:shadow-soft">
                  <h3 className="font-display text-xl text-ink">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Cifras */}
      <section className="py-16 md:py-20">
        <div className="container-cute">
          <Reveal kind="blur">
            <div className="grid gap-6 rounded-[2.5rem] bg-white/62 p-9 ring-1 ring-white/78 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4 md:p-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-[2.6rem] leading-none text-gradient">
                    {stat.value}
                  </p>
                  <p className="mt-2.5 text-sm text-ink-soft">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-16 md:py-24">
        <div className="container-cute">
          <Reveal kind="up">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-lavender-soft via-white/70 to-rose-mist p-10 text-center ring-1 ring-white/78 md:p-16">
              <h2 className="font-display text-[2rem] leading-tight md:text-[2.8rem]">
                ¿Nos acompañas en lo que viene?
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">
                Todavía nos falta muchísimo por crecer, y honestamente, es la
                parte más divertida.
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

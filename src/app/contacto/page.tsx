import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { storeFaqs } from "@/data/reviews";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { Faq } from "@/components/sections/faq";
import { Reveal } from "@/components/motion/reveal";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Escríbenos por WhatsApp, correo o redes. Estamos en ${site.city} y respondemos el mismo día. ${site.contact.schedule}.`,
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: `Contacto · ${site.name}`,
    description: `Hablemos: WhatsApp, correo y redes. Estamos en ${site.city}.`,
    url: "/contacto",
  },
};

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    site.contact.mapQuery,
  )}&output=embed`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Inicio", href: "/" },
            { name: "Contacto", href: "/contacto" },
          ]),
          faqSchema(storeFaqs),
        ]}
      />

      <PageHeader
        eyebrow="Hablemos"
        title="Estamos"
        highlight="aquí para ti"
        description="Escríbenos por donde te quede más fácil. Te responde una persona del equipo, normalmente el mismo día."
        breadcrumbs={[
          { name: "Inicio", href: "/" },
          { name: "Contacto", href: "/contacto" },
        ]}
      />

      <section className="pb-16 md:pb-20">
        <div className="container-cute">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
            <Reveal kind="left">
              <ContactForm />
            </Reveal>

            <div className="space-y-4">
              {/* WhatsApp destacado */}
              <Reveal kind="right">
                <a
                  href={site.social[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift group flex items-center gap-4 rounded-[2rem] bg-gradient-to-br from-mint-soft via-mint/70 to-mint-soft p-7 ring-1 ring-white/70"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/85 text-[#33604f] shadow-petal transition-transform duration-600 group-hover:scale-110">
                    <socialIcons.whatsapp className="size-7" />
                  </span>
                  <span>
                    <span className="block font-display text-xl text-ink">
                      WhatsApp
                    </span>
                    <span className="block text-sm text-ink-soft">
                      {site.contact.whatsappDisplay} · la vía más rápida
                    </span>
                  </span>
                </a>
              </Reveal>

              {/* Datos */}
              <Reveal kind="right" delay={0.08}>
                <ul className="space-y-1 rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/78 backdrop-blur-md">
                  <ContactRow icon={Mail} label="Correo">
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                    >
                      {site.contact.email}
                    </a>
                  </ContactRow>
                  <ContactRow icon={Phone} label="Teléfono">
                    <a
                      href={`tel:+${site.contact.whatsapp}`}
                      className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                    >
                      {site.contact.phoneDisplay}
                    </a>
                  </ContactRow>
                  <ContactRow icon={MapPin} label="Taller">
                    {site.contact.address}
                  </ContactRow>
                  <ContactRow icon={Clock} label="Horario">
                    {site.contact.schedule}
                  </ContactRow>
                </ul>
              </Reveal>

              {/* Redes */}
              <Reveal kind="right" delay={0.16}>
                <div className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/78 backdrop-blur-md">
                  <h2 className="font-display text-lg text-ink">Síguenos</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Publicamos lanzamientos y detrás de cámaras casi todos los días.
                  </p>
                  <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {site.social.slice(1).map((social) => {
                      const Icon = socialIcons[social.icon as SocialIconName];
                      return (
                        <li key={social.name}>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 rounded-2xl bg-white/72 px-4 py-3 text-sm text-ink-soft ring-1 ring-white/80 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:text-ink hover:shadow-petal"
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{social.name}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Mapa */}
          <Reveal kind="blur" delay={0.1} className="mt-8">
            <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/78 shadow-soft">
              <iframe
                src={mapSrc}
                title={`Ubicación de ${site.name} en ${site.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[22rem] w-full border-0 md:h-[26rem]"
              />
            </div>
            <p className="mt-3 text-center text-sm text-ink-soft">
              Nuestro taller no es tienda física todavía, pero puedes recoger tu
              pedido coordinando por WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <Faq
        faqs={storeFaqs}
        eyebrow="Antes de escribir"
        title="Puede que ya"
        highlight="lo hayamos respondido"
      />
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3.5 border-b border-rose/15 py-4 last:border-0">
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-rose-mist text-[#a8556f]">
        <Icon className="size-4.5" strokeWidth={1.9} />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-[0.14em] text-ink-muted">
          {label}
        </span>
        <span className="mt-0.5 block text-ink-soft">{children}</span>
      </span>
    </li>
  );
}

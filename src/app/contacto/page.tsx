import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  formatWhatsapp,
  mapEmbedUrl,
  socialLinks,
  storeLabel,
  telHref,
  whatsappUrl,
} from "@/lib/site-settings";
import { getSiteSettings } from "@/services/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";

/**
 * Página de contacto.
 *
 * No hay un solo dato escrito aquí: WhatsApp, correo, teléfono, horario,
 * dirección y redes salen de `site_settings`. Lo que no esté configurado en el
 * panel no se muestra, y si todavía no hay ningún canal, el formulario queda
 * acompañado de un aviso en vez de datos inventados.
 */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = storeLabel(settings);

  return {
    title: "Contacto",
    description: `Escríbenos y te responde una persona del equipo de ${name}.`,
    alternates: { canonical: "/contacto" },
    openGraph: {
      title: `Contacto · ${name}`,
      description: `Hablemos: escríbenos por el canal que prefieras.`,
      url: "/contacto",
    },
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const name = storeLabel(settings);
  const whatsapp = whatsappUrl(settings.whatsappNumber);
  const phone = telHref(settings.contactPhone);
  const mapSrc = mapEmbedUrl(settings.storeAddress);

  // El WhatsApp ya tiene su tarjeta destacada: aquí solo el resto de redes.
  const socials = socialLinks(settings).filter(
    (social) => social.icon !== "whatsapp",
  );

  const hasDetails = Boolean(
    settings.contactEmail ||
      settings.contactPhone ||
      settings.storeAddress ||
      settings.businessHours,
  );
  const hasChannels = Boolean(whatsapp || hasDetails || socials.length > 0);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", href: "/" },
          { name: "Contacto", href: "/contacto" },
        ])}
      />

      <PageHeader
        eyebrow="Hablemos"
        title="Estamos"
        highlight="aquí para ti"
        description="Escríbenos por donde te quede más fácil. Te responde una persona del equipo, con el gusto de siempre."
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
              {whatsapp && (
                <Reveal kind="right">
                  <a
                    href={whatsapp}
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
                        {formatWhatsapp(settings.whatsappNumber)}
                      </span>
                    </span>
                  </a>
                </Reveal>
              )}

              {/* Datos */}
              {hasDetails && (
                <Reveal kind="right" delay={0.08}>
                  <ul className="space-y-1 rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/78 backdrop-blur-md">
                    {settings.contactEmail && (
                      <ContactRow icon={Mail} label="Correo">
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                        >
                          {settings.contactEmail}
                        </a>
                      </ContactRow>
                    )}

                    {settings.contactPhone && (
                      <ContactRow icon={Phone} label="Teléfono">
                        {phone ? (
                          <a
                            href={phone}
                            className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                          >
                            {settings.contactPhone}
                          </a>
                        ) : (
                          settings.contactPhone
                        )}
                      </ContactRow>
                    )}

                    {settings.storeAddress && (
                      <ContactRow icon={MapPin} label="Dirección">
                        {settings.storeAddress}
                      </ContactRow>
                    )}

                    {settings.businessHours && (
                      <ContactRow icon={Clock} label="Horario">
                        {settings.businessHours}
                      </ContactRow>
                    )}
                  </ul>
                </Reveal>
              )}

              {/* Redes */}
              {socials.length > 0 && (
                <Reveal kind="right" delay={0.16}>
                  <div className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/78 backdrop-blur-md">
                    <h2 className="font-display text-lg text-ink">Síguenos</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                      Ahí publicamos las novedades de la tienda.
                    </p>
                    <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {socials.map((social) => {
                        const Icon = socialIcons[social.icon as SocialIconName];
                        return (
                          <li key={social.name}>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${name} en ${social.name}`}
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
              )}

              {/* Sin ningún canal configurado todavía */}
              {!hasChannels && (
                <Reveal kind="right">
                  <div className="rounded-[2rem] bg-white/62 p-7 ring-1 ring-white/78 backdrop-blur-md">
                    <h2 className="font-display text-lg text-ink">
                      Nuestros canales, muy pronto
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Estamos afinando los datos de atención. Mientras tanto,
                      déjanos tu mensaje en el formulario y te respondemos por
                      correo.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>

          {/* Mapa: solo si hay una dirección de verdad */}
          {mapSrc && (
            <Reveal kind="blur" delay={0.1} className="mt-8">
              <div className="overflow-hidden rounded-[2.5rem] ring-1 ring-white/78 shadow-soft">
                <iframe
                  src={mapSrc}
                  title={`Ubicación de ${name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[22rem] w-full border-0 md:h-[26rem]"
                />
              </div>
              <p className="mt-3 text-center text-sm text-ink-soft">
                {settings.storeAddress}
              </p>
            </Reveal>
          )}
        </div>
      </section>
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

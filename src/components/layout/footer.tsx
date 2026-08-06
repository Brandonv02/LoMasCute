import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { site } from "@/config/site";
import { formatWhatsapp, socialLinks, whatsappUrl } from "@/lib/site-settings";
import { getCategories } from "@/services/catalog";
import { getSiteSettings } from "@/services/site-settings";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { Newsletter } from "@/components/sections/newsletter";
import { PetalDivider } from "@/components/atmosphere/ambient";

/**
 * Pie de la tienda.
 *
 * Los datos de contacto, las redes y los métodos de pago salen de
 * `site_settings`: lo que no esté configurado en el panel, aquí no aparece.
 * Las categorías salen del catálogo real, no de una lista escrita a mano.
 */
export async function Footer() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  const year = new Date().getFullYear();
  const name = settings.storeName || site.name;
  const socials = socialLinks(settings);
  const whatsapp = whatsappUrl(settings.whatsappNumber);
  const hasContact = Boolean(settings.contactEmail || whatsapp);

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Onda pastel de transición */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="size-full">
          <path
            d="M0 96C240 30 480 130 720 96s480-116 720-52v116H0z"
            fill="url(#footerWave)"
          />
          <defs>
            <linearGradient id="footerWave" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#FCD6E2" />
              <stop offset="0.45" stopColor="#DCCEF5" />
              <stop offset="1" stopColor="#BFDCD5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative bg-gradient-to-b from-rose-mist/60 via-cream-deep to-cream pt-40">
        <div className="container-cute">
          <Newsletter />

          <PetalDivider className="mt-20" />

          <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            {/* Marca */}
            <div>
              <Link href="/" className="inline-block" aria-label={`${name} — inicio`}>
                <Image
                  src="/brand/logo-lo-mas-cute.png"
                  alt={name}
                  width={260}
                  height={260}
                  sizes="220px"
                  className="h-20 w-auto transition-transform duration-700 hover:scale-105"
                />
              </Link>

              {settings.storeDescription && (
                <p className="mt-5 max-w-sm leading-relaxed text-ink-soft">
                  {settings.storeDescription}
                </p>
              )}

              {socials.length > 0 && (
                <ul className="mt-7 flex flex-wrap gap-2">
                  {socials.map((social) => {
                    const Icon = socialIcons[social.icon as SocialIconName];
                    return (
                      <li key={social.name}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${name} en ${social.name}`}
                          title={social.name}
                          className="grid size-11 place-items-center rounded-full bg-white/80 text-ink-soft shadow-petal ring-1 ring-white/80 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:text-ink hover:shadow-soft"
                        >
                          <Icon className="size-[1.05rem]" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Enlaces rápidos */}
            <FooterColumn title="Explorar">
              {[
                { label: "Toda la tienda", href: "/tienda" },
                { label: "Lo nuevo", href: "/tienda?orden=nuevo" },
                { label: "Los favoritos", href: "/tienda?orden=favoritos" },
                { label: "Mis favoritos", href: "/favoritos" },
                { label: "Comparar", href: "/comparar" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Contacto", href: "/contacto" },
              ].map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </FooterColumn>

            {/* Categorías: las que existen de verdad en el catálogo */}
            {categories.length > 0 && (
              <FooterColumn title="Categorías">
                {categories.map((cat) => (
                  <FooterLink
                    key={cat.slug}
                    href={cat.comingSoon ? "/tienda" : `/categoria/${cat.slug}`}
                  >
                    {cat.name}
                    {cat.comingSoon && (
                      <span className="ml-1.5 text-[0.65rem] uppercase tracking-widest text-ink-muted">
                        pronto
                      </span>
                    )}
                  </FooterLink>
                ))}
              </FooterColumn>
            )}

            {/* Contacto */}
            {(hasContact || settings.paymentMethods.length > 0) && (
              <FooterColumn title="Hablemos">
                {settings.contactEmail && (
                  <li className="flex items-start gap-2.5 py-1.5">
                    <Mail className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.9} />
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-ink-soft underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                )}

                {whatsapp && (
                  <li className="flex items-start gap-2.5 py-1.5">
                    <socialIcons.whatsapp className="mt-0.5 size-4 shrink-0 text-mint" />
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-soft underline decoration-mint/50 underline-offset-4 transition-colors hover:text-ink"
                    >
                      {formatWhatsapp(settings.whatsappNumber)}
                    </a>
                  </li>
                )}

                {settings.paymentMethods.length > 0 && (
                  <li className="mt-5 rounded-3xl bg-white/70 p-4 ring-1 ring-white/80">
                    <p className="font-display text-sm text-ink">Métodos de pago</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {settings.paymentMethods.map((method) => (
                        <span
                          key={method}
                          className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] text-ink-soft ring-1 ring-rose/20"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </FooterColumn>
            )}
          </div>

          <div className="rule-pastel" />

          <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-ink-soft md:flex-row">
            <p>
              © {year} {name}
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {site.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-xs uppercase tracking-[0.22em] text-ink-muted">
        {title}
      </h3>
      <ul className="mt-5 space-y-0.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 py-1.5 text-ink-soft transition-colors duration-400 hover:text-ink"
      >
        <span
          aria-hidden
          className="h-px w-0 bg-rose transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:w-4"
        />
        {children}
      </Link>
    </li>
  );
}

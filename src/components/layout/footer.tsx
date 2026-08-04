import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { site } from "@/config/site";
import { categories } from "@/data/categories";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { Newsletter } from "@/components/sections/newsletter";
import { PetalDivider } from "@/components/atmosphere/ambient";

export function Footer() {
  const year = new Date().getFullYear();

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
              <Link href="/" className="inline-block" aria-label={`${site.name} — inicio`}>
                <Image
                  src="/brand/logo-lo-mas-cute.png"
                  alt={site.name}
                  width={260}
                  height={260}
                  sizes="220px"
                  className="h-20 w-auto transition-transform duration-700 hover:scale-105"
                />
              </Link>
              <p className="mt-5 max-w-sm leading-relaxed text-ink-soft">{site.promise}</p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {site.social.map((social) => {
                  const Icon = socialIcons[social.icon as SocialIconName];
                  return (
                    <li key={social.name}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${site.name} en ${social.name}`}
                        title={social.name}
                        className="grid size-11 place-items-center rounded-full bg-white/80 text-ink-soft shadow-petal ring-1 ring-white/80 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:text-ink hover:shadow-soft"
                      >
                        <Icon className="size-[1.05rem]" />
                      </a>
                    </li>
                  );
                })}
              </ul>
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

            {/* Categorías */}
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

            {/* Contacto */}
            <FooterColumn title="Hablemos">
              <li className="flex items-start gap-2.5 py-1.5 text-ink-soft">
                <MapPin className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.9} />
                <span>{site.contact.address}</span>
              </li>
              <li className="flex items-start gap-2.5 py-1.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.9} />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-ink-soft underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                >
                  {site.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 py-1.5">
                <socialIcons.whatsapp className="mt-0.5 size-4 shrink-0 text-mint" />
                <a
                  href={site.social[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-soft underline decoration-mint/50 underline-offset-4 transition-colors hover:text-ink"
                >
                  {site.contact.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5 py-1.5 text-ink-soft">
                <Clock className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.9} />
                <span>{site.contact.schedule}</span>
              </li>

              <li className="mt-5 rounded-3xl bg-white/70 p-4 ring-1 ring-white/80">
                <p className="font-display text-sm text-ink">Métodos de pago</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {site.payments
                    .filter((p) => p.active)
                    .map((p) => (
                      <span
                        key={p.id}
                        className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] text-ink-soft ring-1 ring-rose/20"
                      >
                        {p.label}
                      </span>
                    ))}
                </div>
              </li>
            </FooterColumn>
          </div>

          <div className="rule-pastel" />

          <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-ink-soft md:flex-row">
            <p>
              © {year} {site.legalName} · Hecho con mucho cariño en {site.city} 💗
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

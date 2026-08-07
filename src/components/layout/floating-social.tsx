"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import type { SocialLink } from "@/lib/site-settings";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { usePresence } from "@/components/motion/presence";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  whatsapp: "bg-mint-soft text-[#3d6a5e] hover:bg-mint",
  instagram: "bg-rose-soft text-[#8a4c62] hover:bg-rose",
  tiktok: "bg-lavender-soft text-[#5e4b86] hover:bg-lavender",
  facebook: "bg-peach-soft text-[#8a5b3f] hover:bg-peach",
  youtube: "bg-rose-mist text-[#8a4c62] hover:bg-rose-soft",
  pinterest: "bg-gold-soft text-[#7c6023] hover:bg-gold",
  threads: "bg-white text-ink hover:bg-cream-deep",
};

/**
 * Acceso flotante permanente: WhatsApp siempre visible y el resto de redes
 * se abren en abanico. Incluye "volver arriba" cuando ya se bajó bastante.
 *
 * Está fijo en todas las páginas, así que el abanico se anima con transiciones
 * CSS: es de lo poco que el usuario ve en cada vista y no merece una librería.
 *
 * Los enlaces llegan desde `site_settings`: si el panel no tiene ninguna red
 * configurada, no hay botón flotante que abrir.
 */
export function FloatingSocial({
  links = [],
  storeName = "",
}: {
  links?: SocialLink[];
  storeName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setShowTop(window.scrollY > 900);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const top = usePresence(showTop, 450);
  const fan = usePresence(open, 420);

  const whatsapp = links.find((link) => link.icon === "whatsapp");
  const rest = links.filter((link) => link.icon !== "whatsapp");

  // Sin redes configuradas no hay nada que ofrecer: solo sobrevive el botón de
  // "volver arriba", que no depende de la configuración.
  if (!links.length && !top.mounted) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-2.5 md:bottom-7 md:right-7">
      {/* Volver arriba */}
      {top.mounted && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
          className={cn(
            "pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 text-ink shadow-soft ring-1 ring-white/80 backdrop-blur-md transition-all duration-[450ms] [transition-timing-function:var(--ease-silk)] hover:-translate-y-1",
            top.shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-3.5 scale-50 opacity-0",
          )}
        >
          <ArrowUp className="size-4.5" strokeWidth={2} />
        </button>
      )}

      {/* Abanico de redes */}
      {fan.mounted && (
        <ul className="pointer-events-auto flex flex-col items-end gap-2">
          {rest.map((social, i) => {
            const Icon = socialIcons[social.icon as SocialIconName];
            // Al abrir, el de más abajo entra primero (igual que antes).
            const step = fan.shown ? rest.length - 1 - i : i;
            return (
              <li
                key={social.name}
                className={cn(
                  "flex items-center gap-2 transition-all duration-[420ms] [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)]",
                  fan.shown
                    ? "translate-x-0 scale-100 opacity-100"
                    : "translate-x-6 scale-50 opacity-0",
                )}
                style={{ transitionDelay: `${step * 0.045}s` }}
              >
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-ink-soft shadow-petal backdrop-blur-md">
                  {social.name}
                </span>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    storeName ? `${storeName} en ${social.name}` : social.name
                  }
                  className={cn(
                    "grid size-11 place-items-center rounded-full shadow-soft ring-1 ring-white/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift",
                    tones[social.icon],
                  )}
                >
                  <Icon className="size-[1.15rem]" />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/* Botón de más redes: solo si hay más de una */}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar redes sociales" : "Ver todas nuestras redes"}
          className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 text-ink shadow-soft ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-1"
        >
          <Plus
            className={cn(
              "size-5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)]",
              open && "rotate-135",
            )}
            strokeWidth={2}
          />
        </button>
      )}

      {/* WhatsApp: el canal principal, cuando está configurado */}
      {whatsapp && (
        <a
          href={whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
          className="group pointer-events-auto relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-mint-soft via-mint to-mint-soft text-[#33604f] shadow-lift ring-1 ring-white/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:size-15"
        >
          <span
            aria-hidden
            className="absolute inset-0 animate-breathe decor-loop decor-breathe rounded-full bg-mint/45 blur-md"
          />
          <span
            aria-hidden
            className="decor-ping absolute inset-0 rounded-full ring-2 ring-mint/50 motion-safe:animate-ping [animation-duration:3.4s]"
          />
          <socialIcons.whatsapp className="relative size-7 transition-transform duration-500 group-hover:scale-110" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-white/92 px-3.5 py-1.5 text-sm text-ink opacity-0 shadow-soft backdrop-blur-md transition-all duration-500 group-hover:opacity-100 max-md:hidden">
            ¿Te ayudamos? ♡
          </span>
        </a>
      )}
    </div>
  );
}

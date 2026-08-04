"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Plus } from "lucide-react";
import { site } from "@/config/site";
import { socialIcons, type SocialIconName } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

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
 */
export function FloatingSocial() {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsapp = site.social[0];
  const rest = site.social.slice(1);

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-2.5 md:bottom-7 md:right-7">
      {/* Volver arriba */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Volver arriba"
            initial={{ opacity: 0, scale: 0.6, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 14 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/85 text-ink shadow-soft ring-1 ring-white/80 backdrop-blur-md transition-transform duration-500 hover:-translate-y-1"
          >
            <ArrowUp className="size-4.5" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Abanico de redes */}
      <AnimatePresence>
        {open && (
          <motion.ul
            className="pointer-events-auto flex flex-col items-end gap-2"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.045, staggerDirection: -1 } },
            }}
          >
            {rest.map((social) => {
              const Icon = socialIcons[social.icon as SocialIconName];
              return (
                <motion.li
                  key={social.name}
                  variants={{
                    hidden: { opacity: 0, x: 24, scale: 0.5 },
                    show: { opacity: 1, x: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.42, ease: [0.34, 1.32, 0.64, 1] }}
                  className="flex items-center gap-2"
                >
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-ink-soft shadow-petal backdrop-blur-md">
                    {social.name}
                  </span>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.name} en ${social.name}`}
                    className={cn(
                      "grid size-11 place-items-center rounded-full shadow-soft ring-1 ring-white/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift",
                      tones[social.icon],
                    )}
                  >
                    <Icon className="size-[1.15rem]" />
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Botón de más redes */}
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

      {/* WhatsApp: siempre presente */}
      <a
        href={whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="group pointer-events-auto relative grid size-14 place-items-center rounded-full bg-gradient-to-br from-mint-soft via-mint to-mint-soft text-[#33604f] shadow-lift ring-1 ring-white/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:size-15"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-breathe rounded-full bg-mint/45 blur-md"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-mint/50 motion-safe:animate-ping [animation-duration:3.4s]"
        />
        <socialIcons.whatsapp className="relative size-7 transition-transform duration-500 group-hover:scale-110" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-white/92 px-3.5 py-1.5 text-sm text-ink opacity-0 shadow-soft backdrop-blur-md transition-all duration-500 group-hover:opacity-100 max-md:hidden">
          ¿Te ayudamos? ♡
        </span>
      </a>
    </div>
  );
}

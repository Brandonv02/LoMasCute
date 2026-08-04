"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/config/site";
import { Heart, Flower, Sparkle } from "@/components/atmosphere/ambient";

const KEY = "lmc.splash.seen";
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Bienvenida de marca: el logo llega con blur-reveal, los pétalos se abren y
 * una cortina de crema sube para entregar el hero.
 *
 * Solo aparece en la portada y una vez por sesión. Quien llega desde Google a
 * una ficha de producto entra directo al contenido — la intro sería un muro
 * entre esa persona y lo que vino a ver. Si pidió menos movimiento en su
 * sistema, no se muestra nunca.
 */
export function SplashScreen() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;
    const seen = window.sessionStorage.getItem(KEY);
    const wantsCalm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || wantsCalm) return;

    setVisible(true);
    document.documentElement.style.overflow = "hidden";

    const ticker = window.setInterval(
      () => setProgress((p) => Math.min(100, p + 6 + Math.random() * 12)),
      110,
    );
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(KEY, "1");
      setVisible(false);
      document.documentElement.style.overflow = "";
    }, 2500);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(timer);
      document.documentElement.style.overflow = "";
    };
  }, [pathname]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.75, ease: EASE } }}
          role="status"
          aria-live="polite"
          aria-label={`Cargando ${site.name}`}
        >
          {/* Bruma pastel que respira */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ scale: 1.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.1, ease: EASE }}
          >
            <div className="absolute left-1/2 top-1/2 size-[130vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,214,226,0.85),rgba(255,247,244,0)_62%)]" />
            <div className="absolute -left-[10%] top-[12%] size-[52vmax] rounded-full bg-[radial-gradient(circle,rgba(220,206,245,0.6),transparent_66%)] blur-[70px]" />
            <div className="absolute -right-[8%] bottom-[6%] size-[46vmax] rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.55),transparent_66%)] blur-[70px]" />
          </motion.div>

          {/* Anillo de pétalos girando */}
          <motion.div
            aria-hidden
            className="absolute size-[min(78vmin,560px)]"
            initial={{ rotate: -30, opacity: 0, scale: 0.85 }}
            animate={{ rotate: 30, opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "linear" }}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const Shape = i % 3 === 0 ? Heart : i % 3 === 1 ? Flower : Sparkle;
              const tones = ["text-rose", "text-lavender", "text-mint", "text-gold", "text-peach"];
              return (
                <motion.span
                  key={i}
                  className={`absolute left-1/2 top-1/2 ${tones[i % tones.length]}`}
                  style={{
                    x: Math.cos(angle) * 44 + "%",
                    y: Math.sin(angle) * 44 + "%",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.85, 0.5], scale: [0, 1.1, 0.92] }}
                  transition={{ duration: 1.6, delay: 0.35 + i * 0.055, ease: EASE }}
                >
                  <Shape className="size-5 md:size-7" />
                </motion.span>
              );
            })}
          </motion.div>

          {/* Logo con blur reveal */}
          <div className="relative z-10 flex flex-col items-center px-8">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.82, filter: "blur(26px)", y: 22 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.5, ease: EASE }}
            >
              <motion.div
                aria-hidden
                className="absolute inset-[-22%] rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.6),transparent_66%)] blur-3xl"
                animate={{ opacity: [0.4, 0.9, 0.55], scale: [0.9, 1.08, 0.98] }}
                transition={{ duration: 2.6, ease: EASE, repeat: Infinity }}
              />
              <Image
                src="/brand/logo-lo-mas-cute.png"
                alt={site.name}
                width={520}
                height={520}
                priority
                sizes="(max-width: 768px) 78vw, 520px"
                className="w-[min(74vw,430px)] drop-shadow-[0_20px_50px_rgba(214,158,176,0.35)]"
              />
            </motion.div>

            <motion.p
              className="mt-2 text-center font-display text-base tracking-[0.28em] text-ink-soft uppercase md:text-lg"
              initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.85, ease: EASE }}
            >
              {site.tagline}
            </motion.p>

            {/* Barra de carga con brillo */}
            <motion.div
              className="shine relative mt-9 h-[5px] w-52 overflow-hidden rounded-full bg-white/70 ring-1 ring-rose/30"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 208 }}
              transition={{ duration: 1, delay: 1, ease: EASE }}
            >
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-soft via-rose to-lavender"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          </div>

          {/* Cortina: se abre y entrega la página */}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-20 bg-cream"
            initial={{ height: "0%" }}
            exit={{ height: "104%", transition: { duration: 0.95, ease: EASE } }}
            style={{ borderTopLeftRadius: "50% 90px", borderTopRightRadius: "50% 90px" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

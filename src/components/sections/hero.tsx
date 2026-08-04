"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { site } from "@/config/site";
import { ratingSummary } from "@/data/reviews";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { Magnetic, Parallax, Tilt } from "@/components/motion/parallax";
import { Twinkles, Heart, Flower, Sparkle } from "@/components/atmosphere/ambient";

const EASE = [0.22, 1, 0.36, 1] as const;

const floaters = [
  { Shape: Heart, tone: "text-rose", top: "16%", left: "7%", size: 30, delay: 0, dur: 8 },
  { Shape: Flower, tone: "text-lavender", top: "26%", right: "9%", size: 38, delay: 1.2, dur: 10 },
  { Shape: Sparkle, tone: "text-gold", top: "62%", left: "12%", size: 26, delay: 0.6, dur: 7 },
  { Shape: Heart, tone: "text-rose-soft", top: "72%", right: "14%", size: 24, delay: 1.8, dur: 9 },
  { Shape: Flower, tone: "text-mint", top: "8%", right: "26%", size: 28, delay: 2.4, dur: 11 },
  { Shape: Sparkle, tone: "text-peach", top: "48%", right: "4%", size: 22, delay: 0.9, dur: 8.5 },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden pb-20 pt-10 md:min-h-[96svh] md:pb-28"
      aria-labelledby="hero-title"
    >
      {/* Cielo pastel */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-10%,#FFFFFF_0%,#FDEAF1_34%,#FFF7F4_62%,#ECE5FB_100%)]" />
        <motion.div
          className="absolute left-1/2 top-[-18%] size-[86vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,214,226,0.75),transparent_62%)] blur-[60px]"
          animate={reduce ? undefined : { scale: [1, 1.07, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-[12%] top-[36%] size-[46vmax] rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.55),transparent_66%)] blur-[70px]"
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[10%] top-[10%] size-[42vmax] rounded-full bg-[radial-gradient(circle,rgba(244,213,141,0.4),transparent_68%)] blur-[70px]"
          animate={reduce ? undefined : { x: [0, -34, 0], y: [0, 26, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Twinkles count={16} />

      {/* Elementos flotando */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] max-md:hidden">
          {floaters.map((f, i) => (
            <motion.span
              key={i}
              className={`absolute ${f.tone}`}
              style={{ top: f.top, left: f.left, right: f.right, width: f.size, height: f.size }}
              animate={{ y: [0, -22, 0], rotate: [-8, 8, -8], opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <f.Shape className="size-full drop-shadow-[0_4px_12px_rgba(214,158,176,0.3)]" />
            </motion.span>
          ))}
        </div>
      )}

      <div className="container-cute relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Copy */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 shadow-petal ring-1 ring-white/80 backdrop-blur-md"
            >
              <Sparkles className="size-4 text-gold" strokeWidth={2} />
              <span className="font-display text-xs uppercase tracking-[0.2em] text-ink-soft">
                Nuevo · Entregas en {site.city}
              </span>
            </motion.div>

            {/* Logo como titular */}
            <motion.h1
              id="hero-title"
              className="mt-7 flex flex-col items-center lg:items-start"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(22px)", y: 24 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
            >
              <span className="sr-only">
                {site.name} — {site.tagline}
              </span>
              <motion.span
                className="relative block"
                animate={reduce ? undefined : { y: [0, -9, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-[-14%] animate-glow rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_66%)]"
                />
                <Image
                  src="/brand/logo-lo-mas-cute.png"
                  alt=""
                  width={640}
                  height={640}
                  priority
                  sizes="(max-width: 1024px) 88vw, 40rem"
                  className="relative w-[min(86vw,34rem)] drop-shadow-[0_24px_60px_rgba(214,158,176,0.32)]"
                />
              </motion.span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-4 max-w-lg font-display text-2xl leading-tight text-ink md:text-[2rem] lg:mx-0"
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.75, ease: EASE }}
            >
              Cosas lindas para tu día a día,{" "}
              <span className="text-gradient">elegidas una por una</span>.
            </motion.p>

            <motion.p
              className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: EASE }}
            >
              Maquillaje, skincare, accesorios y regalos que se sienten un poquito
              más especiales. Envolvemos todo a mano y llega en 24 a 48 horas.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.05, ease: EASE }}
            >
              <Magnetic>
                <Button asChild size="xl">
                  <Link href="/tienda">
                    Comprar ahora
                    <ArrowRight
                      className="size-4.5 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="xl" variant="cream">
                  <Link href="#categorias">
                    <LayoutGrid className="size-4.5" strokeWidth={1.9} />
                    Ver categorías
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>

            {/* Prueba social */}
            <motion.div
              className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.25 }}
            >
              <div className="flex items-center gap-2.5">
                <Stars rating={ratingSummary.average} size={15} />
                <span className="text-sm text-ink-soft">
                  <strong className="font-semibold text-ink">{ratingSummary.average}</strong> ·{" "}
                  {ratingSummary.count.toLocaleString("es-CO")} clientas felices
                </span>
              </div>
              <span aria-hidden className="hidden h-4 w-px bg-rose/40 sm:block" />
              <p className="text-sm text-ink-soft">Envío gratis desde $120.000</p>
            </motion.div>
          </div>

          {/* Imagen principal */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(24px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.6, delay: 0.35, ease: EASE }}
          >
            <Parallax speed={34} className="relative">
              <Tilt max={10} className="relative mx-auto w-[min(92vw,34rem)]">
                <div className="group relative aspect-square overflow-hidden rounded-[3rem] bg-white/45 shadow-float ring-1 ring-white/70 backdrop-blur-md">
                  <Image
                    src="/art/editorial-hero.svg"
                    alt="Selección de productos de Lo Más Cute sobre un fondo pastel con flores y destellos"
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 34rem"
                    className="object-cover transition-transform duration-[1400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/35"
                  />
                </div>

                {/* Tarjetas flotantes */}
                <motion.div
                  className="glass absolute -left-4 top-10 hidden rounded-3xl px-4 py-3 md:block"
                  animate={reduce ? undefined : { y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="font-display text-sm text-ink">Envuelto a mano ♡</p>
                  <p className="text-xs text-ink-soft">en todos los pedidos</p>
                </motion.div>

                <motion.div
                  className="glass absolute -right-3 bottom-14 hidden rounded-3xl px-4 py-3 md:block"
                  animate={reduce ? undefined : { y: [0, 13, 0] }}
                  transition={{ duration: 7.5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="flex items-center gap-1.5 font-display text-sm text-ink">
                    <span aria-hidden>🚚</span> 24 – 48 horas
                  </p>
                  <p className="text-xs text-ink-soft">en Medellín</p>
                </motion.div>

                <motion.div
                  className="glass absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5"
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 5.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="whitespace-nowrap font-display text-sm text-ink">
                    Nequi · Bancolombia · Transferencia
                  </p>
                </motion.div>
              </Tilt>
            </Parallax>
          </motion.div>
        </div>
      </div>

      {/* Invitación a bajar */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span className="font-display text-[0.65rem] uppercase tracking-[0.26em] text-ink-muted">
          Explora
        </span>
        <motion.span
          className="h-10 w-px bg-gradient-to-b from-rose to-transparent"
          animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}

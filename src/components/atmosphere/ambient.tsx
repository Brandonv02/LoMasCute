"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ formas */

type ShapeProps = React.SVGProps<SVGSVGElement>;

const Heart = ({ className, ...rest }: ShapeProps) => (
  <svg viewBox="0 0 24 20" className={className} aria-hidden {...rest}>
    <path
      d="M12 19C5.5 14 1 10.6 1 6.4 1 3.4 3.4 1 6.4 1 8.5 1 10.5 2.2 12 4.2 13.5 2.2 15.5 1 17.6 1 20.6 1 23 3.4 23 6.4 23 10.6 18.5 14 12 19Z"
      fill="currentColor"
    />
  </svg>
);

const Flower = ({ className, ...rest }: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <g fill="currentColor">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="12" cy="6.4" rx="3.1" ry="5" transform={`rotate(${deg} 12 12)`} />
      ))}
    </g>
    <circle cx="12" cy="12" r="2.4" fill="#F4D58D" />
  </svg>
);

const Sparkle = ({ className, ...rest }: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <path
      d="M12 1.5c.6 4.7 1.8 6 6.5 6.6-4.7.6-5.9 1.9-6.5 6.6-.6-4.7-1.8-6-6.5-6.6 4.7-.6 5.9-1.9 6.5-6.6Z"
      fill="currentColor"
      transform="translate(0 3.3)"
    />
  </svg>
);

const Star = ({ className, ...rest }: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
    <path
      d="M12 2.6l2.7 5.9 6.3.7-4.7 4.4 1.3 6.4L12 16.8 6.4 20l1.3-6.4L3 9.2l6.3-.7z"
      fill="currentColor"
    />
  </svg>
);

const SHAPES = [Heart, Flower, Sparkle, Star] as const;
const TONES = [
  "text-rose",
  "text-rose-soft",
  "text-lavender",
  "text-mint",
  "text-peach",
  "text-gold",
] as const;

/* -------------------------------------------------------------- partículas */

type Particle = {
  id: number;
  Shape: (typeof SHAPES)[number];
  tone: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  spin: number;
};

/**
 * Lluvia inversa de corazones, flores y estrellas. Se genera en el cliente
 * (no en SSR) para que no haya desajuste de hidratación con los valores random,
 * y se pausa cuando la pestaña no está visible.
 */
export function PastelParticles({
  count = 18,
  className,
  zone = "fixed",
}: {
  count?: number;
  className?: string;
  zone?: "fixed" | "absolute";
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const particles = useMemo<Particle[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      Shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      left: Math.random() * 100,
      size: 9 + Math.random() * 20,
      duration: 16 + Math.random() * 20,
      delay: -Math.random() * 30,
      drift: -70 + Math.random() * 140,
      opacity: 0.18 + Math.random() * 0.42,
      spin: -30 + Math.random() * 60,
    }));
  }, [count, mounted]);

  if (reduce || !mounted) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 z-0 overflow-hidden",
        zone === "fixed" ? "fixed" : "absolute",
        className,
      )}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn("absolute bottom-[-12vh] block", p.tone)}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            ["--x-drift" as string]: `${p.drift}px`,
            animation: `riseFall ${p.duration}s linear ${p.delay}s infinite`,
            rotate: `${p.spin}deg`,
          }}
        >
          <p.Shape className="size-full" />
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- aurora */

/** Manchas de luz pastel que respiran detrás del contenido */
export function Aurora({
  className,
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div
        className="absolute -left-[18%] -top-[22%] size-[62vw] rounded-full blur-[110px] animate-drift"
        style={{
          background: `radial-gradient(circle, rgba(248,182,200,${0.55 * intensity}), transparent 68%)`,
        }}
      />
      <div
        className="absolute -right-[14%] top-[6%] size-[52vw] rounded-full blur-[120px] animate-drift [animation-delay:-6s]"
        style={{
          background: `radial-gradient(circle, rgba(220,206,245,${0.5 * intensity}), transparent 68%)`,
        }}
      />
      <div
        className="absolute bottom-[-24%] left-[24%] size-[58vw] rounded-full blur-[130px] animate-drift [animation-delay:-12s]"
        style={{
          background: `radial-gradient(circle, rgba(191,220,213,${0.45 * intensity}), transparent 68%)`,
        }}
      />
      <div
        className="absolute bottom-[8%] right-[18%] size-[34vw] rounded-full blur-[100px] animate-breathe"
        style={{
          background: `radial-gradient(circle, rgba(244,213,141,${0.36 * intensity}), transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------- estrellas fijas */

/** Constelación sutil de destellos que titilan */
export function Twinkles({ count = 14, className }: { count?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stars = useMemo(
    () =>
      mounted
        ? Array.from({ length: count }, (_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: 6 + Math.random() * 14,
            delay: Math.random() * 3.2,
            duration: 2.6 + Math.random() * 2.6,
          }))
        : [],
    [count, mounted],
  );

  if (reduce || !mounted) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {stars.map((s) => (
        <Sparkle
          key={s.id}
          className="absolute text-gold"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s var(--ease-glide) ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------- corazón que flota al fav */

/** Corazoncito que sube y se desvanece al marcar favorito */
export function HeartBurst({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center text-rose"
      initial={false}
      animate={show ? { opacity: [0, 1, 0], y: [0, -34], scale: [0.5, 1.5] } : { opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <Heart className="size-6" />
    </motion.span>
  );
}

/** Barra decorativa de pétalos que separa secciones */
export function PetalDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative flex items-center justify-center gap-3 py-2", className)}>
      <span className="rule-pastel w-full max-w-[8rem]" />
      <Flower className="size-4 text-rose-soft animate-spin-slow" />
      <Heart className="size-3 text-rose" />
      <Flower className="size-4 text-lavender animate-spin-slow [animation-direction:reverse]" />
      <span className="rule-pastel w-full max-w-[8rem]" />
    </div>
  );
}

export { Heart, Flower, Sparkle, Star };

/* ------------------------------------------------- cursor de brillo (desktop) */

/** Rastro de luz cálida que sigue al cursor. Solo puntero fino. */
export function GlowCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      el.style.transform = `translate3d(${currentX - 190}px, ${currentY - 190}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] size-[380px] opacity-0 transition-opacity duration-700 mix-blend-plus-lighter max-[1024px]:hidden"
      style={{
        background:
          "radial-gradient(circle, rgba(255,244,248,0.55), rgba(252,214,226,0.18) 42%, transparent 70%)",
      }}
    />
  );
}

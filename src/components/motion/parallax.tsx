"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Consulta cacheada: leerla en cada mousemove sería un gasto tonto. */
let calmQuery: MediaQueryList | null = null;
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  calmQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return calmQuery.matches;
}

/**
 * Parallax vertical suave, atado al progreso de scroll del propio elemento.
 * `speed` positivo = se queda atrás; negativo = adelanta.
 *
 * El bucle solo corre mientras el elemento está en pantalla y mientras queda
 * movimiento por suavizar: en cuanto se asienta, se apaga. En móvil eso evita
 * un requestAnimationFrame permanente compitiendo con el scroll nativo.
 */
export function Parallax({
  children,
  speed = 60,
  className,
  scaleTo,
  rotateTo,
  opacityFade = false,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  scaleTo?: number;
  rotateTo?: number;
  opacityFade?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    let visible = false;
    let current = -1;

    /** 0 cuando el bloque asoma por abajo, 1 cuando termina de salir por arriba */
    const progress = () => {
      const rect = el.getBoundingClientRect();
      const span = rect.height + window.innerHeight;
      if (span <= 0) return 0.5;
      return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span));
    };

    const paint = (p: number) => {
      const transforms = [`translate3d(0, ${speed - 2 * speed * p}px, 0)`];
      if (scaleTo) {
        const half = 1 - Math.abs(p - 0.5) * 2;
        transforms.push(`scale(${1 + (scaleTo - 1) * half})`);
      }
      if (rotateTo) transforms.push(`rotate(${-rotateTo + 2 * rotateTo * p}deg)`);
      el.style.transform = transforms.join(" ");
      if (opacityFade) {
        const edge = Math.min(1, Math.max(0, p < 0.5 ? p / 0.2 : (1 - p) / 0.2));
        el.style.opacity = `${0.4 + 0.6 * edge}`;
      }
    };

    const tick = () => {
      const target = progress();
      current += (target - current) * 0.14;
      paint(current);
      // Se apaga sola cuando ya alcanzó al scroll: nada de rAF eterno.
      frame =
        visible && Math.abs(target - current) > 0.0004
          ? requestAnimationFrame(tick)
          : 0;
    };

    const kick = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        // Primera vez: partimos ya sincronizados para no dar un salto.
        if (current < 0) {
          current = progress();
          paint(current);
        }
        kick();
      },
      { rootMargin: "15% 0px" },
    );

    observer.observe(el);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed, scaleTo, rotateTo, opacityFade]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/** Tarjeta con inclinación 3D siguiendo el cursor */
export function Tilt({
  children,
  className,
  max = 9,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * max * 2}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div className={cn("scene-3d", className)} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={ref} className="tilt-3d relative size-full">
        {children}
        {glare && (
          <span
            aria-hidden
            className="ambient-decor pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(38% 38% at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.75), transparent 70%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

/** Botón/elemento magnético: se acerca levemente al cursor */
export function Magnetic({
  children,
  strength = 0.18,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  return (
    <div className={cn("inline-flex", className)} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div
        ref={ref}
        className="inline-flex transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
      >
        {children}
      </div>
    </div>
  );
}

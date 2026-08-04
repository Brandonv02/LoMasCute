"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Parallax vertical suave, atado al progreso de scroll del propio elemento.
 * `speed` positivo = se queda atrás; negativo = adelanta.
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const y = useTransform(smooth, [0, 1], [speed, -speed]);
  const scale = useTransform(smooth, [0, 0.5, 1], [1, scaleTo ?? 1, 1]);
  const rotate = useTransform(smooth, [0, 1], [-(rotateTo ?? 0), rotateTo ?? 0]);
  const opacity = useTransform(smooth, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        scale: scaleTo ? scale : undefined,
        rotate: rotateTo ? rotate : undefined,
        opacity: opacityFade ? opacity : undefined,
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
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
  const reduce = useReducedMotion();

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
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
        {glare && !reduce && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
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
  const reduce = useReducedMotion();

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
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

"use client";

import { useEffect, useRef } from "react";

/**
 * Rastro de luz cálida que sigue al cursor. Solo puntero fino.
 *
 * Vive en su propio archivo para que el resto de la atmósfera pueda ser
 * Server Component: es la única pieza que necesita realmente el cliente, y
 * en móvil ni siquiera se descarga (`providers` la pide bajo demanda).
 */
export function GlowCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, []);

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

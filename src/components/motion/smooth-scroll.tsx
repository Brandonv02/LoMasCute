"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll con inercia (Lenis). Se apaga solo si el usuario pidió menos
 * movimiento en su sistema operativo, y también en pantallas táctiles
 * pequeñas, donde el scroll nativo se siente mejor.
 *
 * La librería se importa *después* de esa comprobación: en un teléfono ya no
 * se descarga ni se parsea código que de todos modos no iba a ejecutarse.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || isTouch) return;

    let lenis: import("lenis").default | undefined;
    let onClick: ((event: MouseEvent) => void) | undefined;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 3.2),
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4,
        lerp: 0.09,
        autoRaf: true,
      });

      // Anclas internas con desplazamiento suave y compensación del header
      onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement)?.closest?.(
          'a[href^="#"], a[href*="/#"]',
        ) as HTMLAnchorElement | null;
        if (!anchor) return;
        const url = new URL(anchor.href, window.location.href);
        if (url.pathname !== window.location.pathname || !url.hash) return;
        const target = document.querySelector(url.hash);
        if (!target) return;
        event.preventDefault();
        lenis?.scrollTo(target as HTMLElement, { offset: -110, duration: 1.4 });
        history.replaceState(null, "", url.hash);
      };

      document.addEventListener("click", onClick);
    });

    return () => {
      cancelled = true;
      if (onClick) document.removeEventListener("click", onClick);
      lenis?.destroy();
    };
  }, []);

  // Al navegar entre páginas, volvemos arriba sin animación brusca
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

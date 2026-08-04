"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

/**
 * Scroll con inercia (Lenis). Se apaga solo si el usuario pidió menos
 * movimiento en su sistema operativo, y también en pantallas táctiles
 * pequeñas, donde el scroll nativo se siente mejor.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || isTouch) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      lerp: 0.09,
      autoRaf: true,
    });

    // Anclas internas con desplazamiento suave y compensación del header
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.(
        'a[href^="#"], a[href*="/#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -110, duration: 1.4 });
      history.replaceState(null, "", url.hash);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  // Al navegar entre páginas, volvemos arriba sin animación brusca
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

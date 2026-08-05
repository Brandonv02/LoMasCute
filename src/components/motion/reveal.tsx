"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type RevealKind = "up" | "blur" | "zoom" | "fade" | "left" | "right";

/**
 * Revelado al entrar en viewport. `once` evita que los elementos se re-animen
 * al hacer scroll hacia arriba, que es lo que hace que un sitio se sienta nervioso.
 *
 * El estado oculto y la transición viven en globals.css; aquí solo marcamos el
 * elemento cuando entra. Un único IntersectionObserver por umbral atiende a
 * todas las instancias de la página, así que revelar treinta bloques cuesta
 * treinta atributos y no treinta componentes animados.
 */

const observers = new Map<number, IntersectionObserver>();

function reveal(el: HTMLElement) {
  const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
  if (items.length) {
    const gap = Number(el.dataset.staggerGap ?? 0);
    const base = Number(el.dataset.staggerDelay ?? 0);
    items.forEach((item, i) => {
      item.style.setProperty("--reveal-delay", `${base + i * gap}s`);
      item.dataset.shown = "";
    });
  }
  el.dataset.shown = "";
}

function observerFor(amount: number) {
  let observer = observers.get(amount);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Un umbral por ratio nunca se cumple si el bloque es más alto que la
          // pantalla; en ese caso basta con que asome.
          const taller = entry.boundingClientRect.height > window.innerHeight;
          if (!entry.isIntersecting && !(taller && entry.intersectionRatio > 0)) {
            continue;
          }
          reveal(entry.target as HTMLElement);
          observer!.unobserve(entry.target);
        }
      },
      { threshold: Math.min(amount, 0.9) },
    );
    observers.set(amount, observer);
  }
  return observer;
}

function useReveal(amount: number) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.shown !== undefined) return;

    if (typeof IntersectionObserver === "undefined") {
      reveal(el);
      return;
    }

    const observer = observerFor(amount);
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [amount]);

  return ref as React.RefObject<never>;
}

export function Reveal({
  children,
  kind = "blur",
  delay = 0,
  duration = 0.9,
  className,
  as: Comp = "div",
  amount = 0.25,
  id,
}: {
  children: React.ReactNode;
  kind?: RevealKind;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "article" | "header";
  amount?: number;
  id?: string;
}) {
  const ref = useReveal(amount);

  return (
    <Comp
      ref={ref}
      id={id}
      className={className}
      data-reveal={kind}
      style={
        {
          "--reveal-duration": `${duration}s`,
          "--reveal-delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </Comp>
  );
}

/** Contenedor que revela a sus hijos en cascada */
export function Stagger({
  children,
  className,
  gap = 0.09,
  delay = 0,
  amount = 0.15,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
  as?: "div" | "ul" | "section";
}) {
  const ref = useReveal(amount);

  return (
    <Comp
      ref={ref}
      className={className}
      data-stagger-gap={gap}
      data-stagger-delay={delay}
    >
      {children}
    </Comp>
  );
}

/** Hijo de <Stagger> */
export function StaggerItem({
  children,
  className,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  return (
    <Comp className={cn(className)} data-reveal-item="">
      {children}
    </Comp>
  );
}

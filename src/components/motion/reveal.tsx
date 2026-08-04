"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealKind = "up" | "blur" | "zoom" | "fade" | "left" | "right";

const EASE = [0.22, 1, 0.36, 1] as const;

const kinds: Record<RevealKind, { hidden: TargetAndTransition; show: TargetAndTransition }> = {
  up: { hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0 } },
  blur: {
    hidden: { opacity: 0, y: 26, filter: "blur(14px)", scale: 0.985 },
    show: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
  },
  zoom: { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  left: { hidden: { opacity: 0, x: -44 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 44 }, show: { opacity: 1, x: 0 } },
};

/**
 * Revelado al entrar en viewport. `once` evita que los elementos se re-animen
 * al hacer scroll hacia arriba, que es lo que hace que un sitio se sienta nervioso.
 */
export function Reveal({
  children,
  kind = "blur",
  delay = 0,
  duration = 0.9,
  className,
  as = "div",
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
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  const variant = kinds[kind];

  if (reduce) {
    const Static = as as "div";
    return (
      <Static className={className} id={id}>
        {children}
      </Static>
    );
  }

  return (
    <Comp
      id={id}
      className={className}
      initial={variant.hidden}
      whileInView={variant.show}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
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
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };

  if (reduce) {
    const Static = as as "div";
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Comp>
  );
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

/** Hijo de <Stagger> */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  if (reduce) {
    const Static = as as "div";
    return <Static className={className}>{children}</Static>;
  }
  return (
    <Comp className={cn(className)} variants={staggerItem}>
      {children}
    </Comp>
  );
}

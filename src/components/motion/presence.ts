"use client";

import { useEffect, useState } from "react";

/**
 * Mantiene un nodo montado mientras dura su animación de salida — lo mismo que
 * hacía <AnimatePresence>, en unas pocas líneas y sin librería.
 *
 * `mounted` dice si hay que pintarlo; `shown` es el estado al que transiciona,
 * y se activa un frame después de montar para que la animación de entrada
 * tenga desde dónde salir.
 */
export function usePresence(active: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(active);
  const [shown, setShown] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [active, exitMs]);

  return { mounted, shown };
}

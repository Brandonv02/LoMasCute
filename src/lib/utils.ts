import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** 48900 -> "$ 48.900" */
export function formatCOP(value: number) {
  return cop.format(value).replace(/\s/g, " ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Quita acentos y minúsculas: base de la búsqueda tolerante */
export function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Puntúa qué tan bien encaja `needle` en `haystack`, tolerando acentos,
 * erratas y letras faltantes.
 *
 * Los niveles están separados a propósito para que el orden de resultados
 * tenga sentido: una coincidencia literal siempre gana a un prefijo de
 * palabra, y ese gana a una subsecuencia dispersa. Sin esa separación,
 * buscar "labiar" ponía una paleta de sombras por encima de los labiales,
 * porque sus letras aparecían salteadas en la descripción.
 */
export function fuzzyScore(needle: string, haystack: string) {
  const n = normalize(needle);
  const h = normalize(haystack);
  if (!n || !h) return 0;

  // 1. Coincidencia literal: cuanto más al principio, mejor
  const at = h.indexOf(n);
  if (at >= 0) return 1 - (at / Math.max(h.length, 1)) * 0.2;

  // 2. Alguna palabra empieza igual ("labiar" → "labial")
  if (n.length >= 3) {
    const prefix = n.slice(0, Math.max(3, n.length - 2));
    if (h.split(/[\s,·/-]+/).some((word) => word.startsWith(prefix))) return 0.78;
  }

  // 3. Subsecuencia: penalizada según lo dispersas que estén las letras
  let start = -1;
  let index = 0;
  for (let i = 0; i < h.length && index < n.length; i++) {
    if (h[i] === n[index]) {
      if (index === 0) start = i;
      index++;
      if (index === n.length) {
        const span = i - start + 1;
        return 0.4 * (n.length / span);
      }
    }
  }

  return 0;
}

export function pluralize(count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

export const currencyToNumber = (value: string) =>
  Number(value.replace(/[^\d]/g, "")) || 0;

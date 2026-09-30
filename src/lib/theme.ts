/**
 * Paleta de marca en tiempo de ejecución.
 *
 * Los tokens de fábrica viven en el bloque `@theme` de `globals.css` como
 * variables CSS (`--color-rose`, `--color-mint`…), y cada clase de Tailwind
 * que los usa (`bg-rose`, `text-mint`…) compila a `var(--color-rose)`. Eso
 * significa que sobreescribir esas variables en tiempo de ejecución repinta
 * toda la tienda sin tocar un solo componente.
 *
 * Este módulo traduce los 4 colores base que edita /admin/configuracion en
 * los tonos derivados que el sistema de diseño espera (claro y muy claro),
 * mezclando con blanco igual que se hizo a mano para la paleta pastel
 * original. Un color vacío no genera ninguna variable: ese tono conserva el
 * pastel de fábrica.
 */

import type { SiteSettings } from "@/lib/site-settings";

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** Mezcla `hex` con blanco. `amount` es cuánto blanco entra (0 a 1). */
function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  ]);
}

/** Mezcla `hex` con negro. `amount` es cuánto negro entra (0 a 1). */
function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)]);
}

type HuePick = Pick<
  SiteSettings,
  "colorPrimary" | "colorSecondary" | "colorAccent" | "colorBackground"
>;

/**
 * Variables CSS a sobreescribir para cada color configurado. Vacío el campo,
 * ese grupo de variables no aparece y el `@theme` de fábrica manda.
 */
function huesToVars(settings: HuePick): Record<string, string> {
  const vars: Record<string, string> = {};

  if (settings.colorPrimary) {
    const base = settings.colorPrimary;
    vars["--color-rose"] = base;
    vars["--color-rose-soft"] = lighten(base, 0.45);
    vars["--color-rose-mist"] = lighten(base, 0.78);
  }

  if (settings.colorSecondary) {
    const base = settings.colorSecondary;
    vars["--color-mint"] = base;
    vars["--color-mint-soft"] = lighten(base, 0.55);
  }

  if (settings.colorAccent) {
    const base = settings.colorAccent;
    vars["--color-lavender"] = base;
    vars["--color-lavender-soft"] = lighten(base, 0.55);
  }

  if (settings.colorBackground) {
    const base = settings.colorBackground;
    vars["--color-cream"] = base;
    vars["--color-cream-deep"] = darken(base, 0.03);
  }

  return vars;
}

/**
 * CSS listo para un `<style>` en el layout raíz, o `null` si nadie ha
 * personalizado ningún color (la tienda usa el pastel de fábrica tal cual).
 */
export function brandThemeCss(settings: HuePick): string | null {
  const vars = huesToVars(settings);
  const declarations = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

  return declarations ? `:root{${declarations}}` : null;
}

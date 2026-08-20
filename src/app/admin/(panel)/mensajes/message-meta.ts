import type { ContactStatus } from "@/lib/supabase/types";
import type { Tone } from "@/components/admin/ui";

/**
 * Cómo se llama y de qué color se pinta cada estado de un mensaje.
 *
 * Vive aquí, y no en el servicio, porque los controles de la tabla son cliente
 * y necesitan las mismas etiquetas que las celdas del servidor. Es
 * presentación: los valores válidos los impone el enum de la base.
 */

export const CONTACT_STATUS_META: Record<
  ContactStatus,
  { label: string; tone: Tone; hint: string }
> = {
  nuevo: { label: "Nuevo", tone: "rose", hint: "sin abrir" },
  leido: { label: "Leído", tone: "gold", hint: "visto, sin responder" },
  respondido: { label: "Respondido", tone: "mint", hint: "cerrado" },
  archivado: { label: "Archivado", tone: "neutral", hint: "fuera de la bandeja" },
};

/** Fecha y hora del mensaje, en el formato corto del panel. */
export function messageDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  })} · ${date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

/** Fecha larga para la ficha del mensaje: ahí sí sobra el espacio. */
export function messageDateLong(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })} · ${date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

/** Iniciales para el avatar de la fila. "Ana María" → "AM" */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

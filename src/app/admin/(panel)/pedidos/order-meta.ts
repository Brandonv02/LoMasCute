import type { OrderStatus, PaymentMethod } from "@/lib/supabase/types";
import type { Tone } from "@/components/admin/ui";

/**
 * Cómo se llama y de qué color se pinta cada estado y cada forma de pago.
 *
 * Vive aquí, y no en el servicio, porque el formulario de venta es cliente y
 * necesita las mismas etiquetas que la tabla del servidor. Es presentación, no
 * datos: los valores válidos los impone el enum de la base.
 */

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  pendiente: { label: "Pendiente", tone: "gold" },
  pagado: { label: "Pagado", tone: "mint" },
  entregado: { label: "Entregado", tone: "lavender" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  transferencia: "Transferencia",
  otro: "Otro",
};

/** Fecha y hora de la venta, en el formato corto del panel. */
export function saleDateTime(iso: string): string {
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

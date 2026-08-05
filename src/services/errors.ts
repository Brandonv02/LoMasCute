import type { PostgrestError } from "@supabase/supabase-js";
import { SupabaseNotConfiguredError } from "@/lib/supabase/client";

/**
 * Traducción de errores de Postgres a algo que se pueda enseñar en pantalla.
 *
 * Los códigos son los de PostgreSQL; las restricciones son las declaradas en
 * `supabase/migrations/0001_init.sql`. Sin esto, un slug repetido llega a la
 * interfaz como "duplicate key value violates unique constraint
 * products_slug_key", que no le dice nada a quien está cargando el catálogo.
 */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

const CONSTRAINT_MESSAGES: Record<string, string> = {
  products_slug_key: "Ya existe un producto con ese slug. Prueba con otro.",
  categories_slug_key: "Ya existe una categoría con ese slug.",
  products_slug_format:
    "El slug solo admite minúsculas, números y guiones (por ejemplo: labial-cloud-kiss).",
  categories_slug_format:
    "El slug solo admite minúsculas, números y guiones.",
  products_compare_at_higher:
    "El precio anterior tiene que ser mayor que el precio actual.",
  products_price_positive: "El precio no puede ser negativo.",
  products_stock_positive: "El stock no puede ser negativo.",
  products_rating_range: "La valoración tiene que estar entre 0 y 5.",
};

export function toServiceError(error: PostgrestError): ServiceError {
  // El mensaje de Postgres nombra la restricción que saltó.
  for (const [constraint, message] of Object.entries(CONSTRAINT_MESSAGES)) {
    if (error.message.includes(constraint)) return new ServiceError(message);
  }

  if (error.code === "23503") {
    return new ServiceError("La categoría seleccionada ya no existe.");
  }
  if (error.code === "23505") {
    return new ServiceError("Ese valor ya está en uso.");
  }
  if (error.code === "PGRST116") {
    return new ServiceError("No encontramos el registro.");
  }

  return new ServiceError(error.message);
}

/** Mensaje presentable para cualquier error que llegue de la capa de datos. */
export function messageFor(error: unknown): string {
  if (error instanceof SupabaseNotConfiguredError) return error.message;
  if (error instanceof ServiceError) return error.message;
  if (error instanceof Error) return error.message;
  return "Algo salió mal. Vuelve a intentarlo.";
}

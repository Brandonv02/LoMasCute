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

  /**
   * Fallos de credenciales disfrazados de fallos de datos.
   *
   * Los dos llegan aquí como si fueran problemas de la tabla, y no lo son:
   *
   *  · 42501 en una tabla privada significa que la petición viajó con la clave
   *    pública. Con `service_role` no puede ocurrir: se salta RLS y tiene los
   *    privilegios concedidos en 0006_orders.sql.
   *  · "Unregistered API key" es una clave rotada en Supabase que este
   *    despliegue todavía no tiene.
   */
  if (error.code === "42501") {
    return new ServiceError(
      "La base rechazó la operación por permisos. El panel está entrando con la " +
        "clave pública: revisa SUPABASE_SERVICE_ROLE_KEY en el entorno " +
        "(tiene que ser la clave privada, no la publicable).",
    );
  }
  if (/unregistered api key|invalid api key/i.test(error.message)) {
    return new ServiceError(
      "Supabase no reconoce la clave del panel: se rotó y este despliegue sigue " +
        "con la anterior. Copia la clave privada actual desde Project Settings → " +
        "API Keys a SUPABASE_SERVICE_ROLE_KEY.",
    );
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

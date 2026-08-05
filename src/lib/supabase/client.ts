import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Clientes de Supabase. Solo servidor.
 *
 * `server-only` es deliberado: la clave `service_role` se salta RLS, así que
 * un import accidental desde un componente de cliente tiene que romper la
 * compilación, no llegar a producción.
 *
 * Hay dos clientes porque tienen permisos distintos:
 *
 *  · `publicClient` usa la clave anónima y respeta RLS. Es el que usaría la
 *    tienda: solo ve lo publicado.
 *  · `adminClient` usa `service_role` y se salta RLS. Es el que usa el panel,
 *    que necesita ver borradores y archivados, y escribir. Mientras no exista
 *    autenticación, esta es la frontera de seguridad: el panel escribe porque
 *    corre en el servidor, no porque quien lo abre esté identificado.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Permite que el panel se pinte con un aviso de configuración en lugar de
 * reventar cuando todavía no hay proyecto de Supabase conectado.
 */
export function isSupabaseConfigured() {
  return Boolean(url && anonKey && serviceKey);
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase no está configurado. Falta NEXT_PUBLIC_SUPABASE_URL, " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY en .env.local.",
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

const options = {
  auth: {
    // No hay sesiones: cada petición del servidor es independiente.
    persistSession: false,
    autoRefreshToken: false,
  },
} as const;

let cachedPublic: SupabaseClient<Database> | null = null;
let cachedAdmin: SupabaseClient<Database> | null = null;

/** Cliente con clave anónima: respeta RLS, solo ve lo publicado. */
export function publicClient(): SupabaseClient<Database> {
  if (!url || !anonKey) throw new SupabaseNotConfiguredError();
  cachedPublic ??= createClient<Database>(url, anonKey, options);
  return cachedPublic;
}

/** Cliente con `service_role`: se salta RLS. Nunca debe salir del servidor. */
export function adminClient(): SupabaseClient<Database> {
  if (!url || !serviceKey) throw new SupabaseNotConfiguredError();
  cachedAdmin ??= createClient<Database>(url, serviceKey, options);
  return cachedAdmin;
}

/** Nombre del bucket de imágenes de producto (ver 0003_storage.sql). */
export const PRODUCTS_BUCKET = "products";

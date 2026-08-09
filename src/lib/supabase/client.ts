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
 * Qué clase de clave es.
 *
 * Supabase tiene dos formatos vivos y hay que reconocer los dos:
 *
 *  · El nuevo, por prefijo: `sb_secret_…` (privada) y `sb_publishable_…`
 *    (pública).
 *  · El clásico, un JWT cuyo `role` es `service_role` o `anon`.
 *
 * Distinguirlas importa porque las dos "funcionan": con la pública el panel
 * conecta sin error y solo falla al tocar una tabla privada, con un
 * `permission denied for table orders` que no dice nada de la causa real.
 */
type KeyKind = "privada" | "publica" | "desconocida";

function keyKind(key: string): KeyKind {
  if (key.startsWith("sb_secret_")) return "privada";
  if (key.startsWith("sb_publishable_")) return "publica";

  const payload = key.split(".")[1];
  if (!payload) return "desconocida";

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8"),
    ) as { role?: string };
    if (claims.role === "service_role") return "privada";
    if (claims.role === "anon") return "publica";
  } catch {
    /* no era un JWT legible */
  }

  return "desconocida";
}

/** La clave del panel tiene que ser la privada; ninguna otra sirve. */
function isServiceKey(key: string | undefined): key is string {
  return Boolean(key) && keyKind(key as string) === "privada";
}

/**
 * Permite que el panel se pinte con un aviso de configuración en lugar de
 * reventar cuando todavía no hay proyecto de Supabase conectado.
 */
export function isSupabaseConfigured() {
  return Boolean(url && anonKey && serviceKey);
}

/**
 * Lo que necesita el panel: además de existir, la clave privada tiene que
 * serlo de verdad. Las pantallas que leen tablas privadas —Pedidos -- la usan
 * para mostrar el aviso de configuración en vez de un error de base de datos.
 */
export function isAdminConfigured() {
  return Boolean(url && isServiceKey(serviceKey));
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

/**
 * La variable existe pero no lleva la clave privada.
 *
 * Es el fallo que se veía en producción: con la clave pública en esa variable,
 * el panel entra a la base como `anon`. El catálogo se lee igual —es público—
 * pero `orders` y `order_items` están cerradas a `anon`, así que Postgres
 * responde `permission denied for table orders`. El mensaje señala la variable
 * y no la tabla, que es donde está el problema.
 */
export class SupabaseServiceKeyError extends Error {
  constructor(kind: KeyKind) {
    super(
      `SUPABASE_SERVICE_ROLE_KEY no contiene la clave privada del proyecto ` +
        `(parece ${kind === "publica" ? "la clave pública" : "una clave de otro tipo"}). ` +
        "El panel entraría a la base como `anon` y las tablas privadas —orders, " +
        "order_items— responderían «permission denied». Copia la clave secreta " +
        "(Supabase → Project Settings → API Keys → `service_role` / `sb_secret_…`) " +
        "en esa variable, también en el entorno de producción.",
    );
    this.name = "SupabaseServiceKeyError";
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

/**
 * Cliente con `service_role`: se salta RLS. Nunca debe salir del servidor.
 *
 * Comprueba la clase de clave antes de crear el cliente. Sin esa comprobación,
 * una clave pública en la variable equivocada no da ningún error al conectar:
 * el panel funciona a medias —lee el catálogo, que es público— y solo revienta
 * al abrir Pedidos, con un error de permisos de Postgres que apunta a la tabla
 * en vez de a la configuración.
 */
export function adminClient(): SupabaseClient<Database> {
  if (!url || !serviceKey) throw new SupabaseNotConfiguredError();
  if (!isServiceKey(serviceKey)) throw new SupabaseServiceKeyError(keyKind(serviceKey));
  cachedAdmin ??= createClient<Database>(url, serviceKey, options);
  return cachedAdmin;
}

/** Nombre del bucket de imágenes de producto (ver 0003_storage.sql). */
export const PRODUCTS_BUCKET = "products";

// El bucket del arte de la tienda ("site", ver 0005_site_settings.sql) se
// declara en `@/lib/site-settings`: el panel lo necesita desde el navegador y
// este módulo es `server-only`.

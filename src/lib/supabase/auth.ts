import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { SupabaseNotConfiguredError } from "@/lib/supabase/client";

/**
 * Sesión del panel.
 *
 * Tres reglas que no cambian:
 *
 *  · Usa la clave **pública**, nunca `service_role`. La sesión es de la persona
 *    que entra, no del servidor: la clave privada sigue viviendo solo en
 *    `client.ts` y jamás viaja al navegador.
 *  · La sesión va en cookies `httpOnly` que escribe el servidor, así que
 *    sobrevive a recargas y a cerrar el navegador sin que ningún JavaScript de
 *    la página pueda leer el token.
 *  · Quién puede entrar lo decide Supabase Auth. Aquí no hay lista de correos
 *    ni contraseñas: solo se pregunta si hay sesión válida.
 *
 * El panel sigue leyendo y escribiendo con `service_role` desde el servidor
 * (`adminClient()`); lo que cambia es que ahora nadie llega a esas rutas sin
 * haber iniciado sesión.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** ¿Se puede siquiera intentar iniciar sesión? */
export function isAuthConfigured() {
  return Boolean(url && anonKey);
}

/**
 * Cliente atado a las cookies de la petición.
 *
 * En Server Components las cookies son de solo lectura: Next lanza si se
 * intenta escribir. Por eso `setAll` ignora el fallo — quien renueva la sesión
 * es el middleware, que sí puede escribir en la respuesta.
 */
export async function authClient() {
  if (!url || !anonKey) throw new SupabaseNotConfiguredError();

  const store = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          /* Server Component: la renovación la hace el middleware */
        }
      },
    },
  });
}

/**
 * ¿Esta cuenta puede entrar al panel?
 *
 * Tener sesión no basta. El registro por correo de Supabase se puede dejar
 * abierto —de hecho viene así— y la clave pública viaja en el navegador, así
 * que cualquiera podría crearse una cuenta y llamar a la puerta. Lo que decide
 * es una marca en `app_metadata`, que **solo** se puede escribir con la clave
 * privada o desde el panel de Supabase: ni el titular de la cuenta puede
 * ponérsela a sí mismo (a diferencia de `user_metadata`, que sí es editable
 * por quien inicia sesión).
 *
 * Marcar una cuenta como administradora, una sola vez, en el SQL Editor:
 *
 *   update auth.users
 *      set raw_app_meta_data =
 *          coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 *    where email = 'tucorreo@tudominio.com';
 */
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;

  const meta = (user.app_metadata ?? {}) as {
    role?: unknown;
    roles?: unknown;
    admin?: unknown;
  };

  if (meta.admin === true) return true;
  if (meta.role === "admin") return true;
  if (Array.isArray(meta.roles) && meta.roles.includes("admin")) return true;

  return false;
}

/**
 * Quién está dentro, o `null`.
 *
 * Se usa `getUser()` y no `getSession()` a propósito: `getUser()` valida el
 * token contra Supabase, mientras que la sesión de la cookie se podría haber
 * manipulado. Es la diferencia entre confiar en el cliente y comprobarlo.
 *
 * Devuelve la cuenta aunque no sea administradora: quien llama decide qué
 * hacer con ella, y así el login puede explicar el motivo del rechazo en vez
 * de repetir «credenciales incorrectas» a alguien que sí las acertó.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!isAuthConfigured()) return null;

  const { data, error } = await (await authClient()).auth.getUser();
  if (error) return null;
  return data.user;
}

/** La cuenta que puede usar el panel, o `null`. */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  return isAdminUser(user) ? user : null;
}

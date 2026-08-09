import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Puerta del panel.
 *
 * Se ejecuta antes que cualquier página de `/admin` y hace dos cosas:
 *
 *  1. Renueva la sesión. Es el único sitio donde se pueden escribir cookies en
 *     cada petición, así que aquí es donde el token se refresca solo y la
 *     sesión se mantiene abierta entre visitas.
 *  2. Decide quién pasa. Sin sesión, cualquier ruta de `/admin` lleva al login
 *     conservando el destino; con sesión, el login lleva al panel.
 *
 * La tienda no entra aquí: el `matcher` es solo `/admin`. Y la comprobación se
 * repite en el layout del panel — una sola línea de defensa es una línea que
 * algún día se salta un `rewrite`.
 */

const LOGIN = "/admin/login";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin credenciales no hay sesión que validar: el panel ya muestra su propio
  // aviso de configuración y bloquearlo aquí solo daría un bucle de redirección.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Valida el token contra Supabase y, de paso, lo renueva si tocaba.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * Tener cuenta no es tener permiso.
   *
   * El registro por correo de Supabase puede estar abierto, así que la puerta
   * la abre una marca en `app_metadata` —que solo se escribe con la clave
   * privada— y no el simple hecho de haber iniciado sesión.
   */
  const meta = (user?.app_metadata ?? {}) as {
    role?: unknown;
    roles?: unknown;
    admin?: unknown;
  };
  const esAdmin =
    Boolean(user) &&
    (meta.admin === true ||
      meta.role === "admin" ||
      (Array.isArray(meta.roles) && meta.roles.includes("admin")));

  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === LOGIN;

  if (!esAdmin && !isLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = LOGIN;
    destino.search = "";
    // Para volver justo donde quería entrar después de identificarse.
    destino.searchParams.set("volver", pathname + search);
    return NextResponse.redirect(destino);
  }

  if (esAdmin && isLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/dashboard";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  // Solo el panel. La tienda pública no pasa por aquí.
  matcher: ["/admin/:path*"],
};

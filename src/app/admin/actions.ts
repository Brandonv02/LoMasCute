"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, isAdminUser, isAuthConfigured } from "@/lib/supabase/auth";

/**
 * Entrar y salir del panel.
 *
 * Todo lo que decide si alguien puede pasar vive en Supabase Auth: aquí no hay
 * lista de correos, ni contraseña de respaldo, ni comparación propia. Estas dos
 * acciones solo trasladan la respuesta de Supabase a la interfaz.
 *
 * Tampoco hay registro: crear la cuenta del equipo es una operación del panel
 * de Supabase, no de esta aplicación. Una pantalla pública de alta convertiría
 * la puerta del negocio en un formulario abierto.
 */

export type LoginResult = { ok: false; message: string } | null;

/** Destinos permitidos tras entrar: solo rutas internas del panel. */
function destinoSeguro(volver: string | null): string {
  if (!volver || !volver.startsWith("/admin") || volver.startsWith("/admin/login")) {
    return "/admin/dashboard";
  }
  // Nada de "//host" ni "/admin\..": solo una ruta relativa limpia.
  if (volver.startsWith("//") || volver.includes("\\")) return "/admin/dashboard";
  return volver;
}

export async function signInAction(
  _prev: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  if (!isAuthConfigured()) {
    return {
      ok: false,
      message:
        "Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Escribe tu correo y tu contraseña." };
  }

  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // El mensaje no distingue entre "no existe" y "contraseña incorrecta": eso
    // permitiría averiguar qué correos tienen cuenta.
    const credenciales =
      error.status === 400 || /invalid login credentials/i.test(error.message);

    return {
      ok: false,
      message: credenciales
        ? "Correo o contraseña incorrectos."
        : `No se pudo entrar: ${error.message}`,
    };
  }

  /**
   * Credenciales correctas no significan acceso.
   *
   * Si la cuenta no está marcada como administradora, se cierra la sesión que
   * se acaba de abrir: así no queda una cookie válida rondando para una cuenta
   * que no puede entrar.
   */
  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "Esa cuenta no tiene acceso al panel. Márcala como administradora en " +
        "Supabase (ver supabase/README.md).",
    };
  }

  const volver = destinoSeguro(String(formData.get("volver") ?? ""));
  revalidatePath("/admin", "layout");
  redirect(volver);
}

export async function signOutAction(): Promise<void> {
  if (isAuthConfigured()) {
    await (await authClient()).auth.signOut();
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

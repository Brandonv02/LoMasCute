import { redirect } from "next/navigation";
import { getAdminUser, isAuthConfigured } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/shell";

/**
 * DashboardLayout: envuelve todas las secciones del panel (Dashboard,
 * Productos, Categorías, Pedidos, Clientes, Inventario y Configuración).
 *
 * El grupo de rutas `(panel)` no aparece en la URL, así que las secciones
 * quedan como hermanas (/admin/pedidos, /admin/clientes…) mientras comparten
 * este mismo armazón. El login queda fuera, que es justo lo que se espera.
 *
 * Aquí se vuelve a comprobar la sesión aunque el middleware ya lo haya hecho.
 * No es desconfianza gratuita: el middleware no cubre todos los caminos de
 * renderizado, y esta es la última puerta antes de que una pantalla lea
 * pedidos, clientes o inventario.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin credenciales de Supabase no hay sesión posible: las propias pantallas
  // muestran el aviso de configuración en vez de mandar a un login inservible.
  if (isAuthConfigured()) {
    const user = await getAdminUser();
    if (!user) redirect("/admin/login");

    return <AdminShell user={{ email: user.email ?? "" }}>{children}</AdminShell>;
  }

  return <AdminShell>{children}</AdminShell>;
}

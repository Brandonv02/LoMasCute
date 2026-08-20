import { redirect } from "next/navigation";
import { getAdminUser, isAuthConfigured } from "@/lib/supabase/auth";
import { countNewContactMessages } from "@/services/contact";
import { countPendingOnlineOrders } from "@/services/orders";
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
 *
 * También es donde se calculan las cifras de aviso del menú: la barra lateral
 * es un componente de cliente y no puede consultar la base, así que las recibe
 * ya resueltas. `countNewContactMessages` nunca lanza —un contador roto no
 * puede tumbar el panel entero, incluida la pantalla que explica qué falta
 * configurar.
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

    const [mensajes, pedidos] = await Promise.all([
      countNewContactMessages(),
      countPendingOnlineOrders(),
    ]);

    const badges: Record<string, number> = {};
    if (mensajes) badges["/admin/mensajes"] = mensajes;
    if (pedidos) badges["/admin/pedidos"] = pedidos;

    return (
      <AdminShell
        user={{ email: user.email ?? "" }}
        badges={Object.keys(badges).length ? badges : undefined}
      >
        {children}
      </AdminShell>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

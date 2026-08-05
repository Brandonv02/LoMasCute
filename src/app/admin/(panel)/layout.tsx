import { AdminShell } from "@/components/admin/shell";

/**
 * DashboardLayout: envuelve todas las secciones del panel (Dashboard,
 * Productos, Categorías, Pedidos, Clientes, Inventario y Configuración).
 *
 * El grupo de rutas `(panel)` no aparece en la URL, así que las secciones
 * quedan como hermanas (/admin/pedidos, /admin/clientes…) mientras comparten
 * este mismo armazón. El login queda fuera, que es justo lo que se espera.
 */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

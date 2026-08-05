import {
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  Shapes,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Descripción corta que se usa en breadcrumbs y en la cabecera de página */
  description: string;
  /** Contador de aviso. Datos simulados: aquí no hay lógica de negocio. */
  badge?: number;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

/**
 * Única fuente de verdad de la navegación del panel: la usan el sidebar, los
 * breadcrumbs y el buscador de la topbar. Añadir una sección es añadir una
 * entrada aquí y su page.tsx.
 *
 * Deliberadamente no importa datos del catálogo: este módulo viaja al cliente
 * (el sidebar es interactivo) y no queremos arrastrar productos con él.
 */
export const adminNav: AdminNavGroup[] = [
  {
    label: "General",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Cómo va la tienda hoy",
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        href: "/admin/productos",
        label: "Productos",
        icon: Package,
        description: "Todo lo que está a la venta",
      },
      {
        href: "/admin/categorias",
        label: "Categorías",
        icon: Shapes,
        description: "Cómo se organiza la tienda",
      },
      {
        href: "/admin/inventario",
        label: "Inventario",
        icon: Boxes,
        description: "Existencias y reposición",
        badge: 5,
      },
    ],
  },
  {
    label: "Ventas",
    items: [
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ShoppingBag,
        description: "Pedidos y su estado",
        badge: 4,
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Users,
        description: "Quién compra en Lo Más Cute",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
        description: "Marca, envíos y pagos",
      },
    ],
  },
];

export const adminNavItems = adminNav.flatMap((group) => group.items);

export const adminNavByHref = new Map(
  adminNavItems.map((item) => [item.href, item]),
);

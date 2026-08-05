"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { usePresence } from "@/components/motion/presence";
import { cn } from "@/lib/utils";

const KEY = "lmc.admin.sidebar";

/**
 * DashboardLayout: la estructura que comparten todas las secciones del panel.
 *
 * Vive en el layout de la ruta, no en cada página, así que el estado del
 * sidebar (colapsado o no) sobrevive a la navegación: cambiar de Pedidos a
 * Clientes no vuelve a montar la barra ni la hace parpadear.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawer = usePresence(menuOpen, 500);

  // Preferencia recordada entre visitas
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(KEY) === "1");
    } catch {
      /* almacenamiento bloqueado: se queda expandido */
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* sin persistencia */
      }
      return next;
    });
  };

  // Al cambiar de sección, el cajón móvil se cierra solo
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="admin-shell flex">
      {/* Barra lateral de escritorio */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r transition-[width] duration-500 [transition-timing-function:var(--ease-silk)] lg:block",
          collapsed ? "w-[5.5rem]" : "w-[17.5rem]",
        )}
        style={{
          borderColor: "var(--admin-line-soft)",
          background: "color-mix(in oklab, var(--admin-canvas-deep) 70%, transparent)",
        }}
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      {/* Cajón móvil */}
      {drawer.mounted && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú del panel"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "absolute inset-0 bg-[#3a2f36]/35 backdrop-blur-md transition-opacity duration-500",
              drawer.shown ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "admin-shell absolute inset-y-0 left-0 flex w-[min(84vw,18rem)] flex-col rounded-r-[2rem] shadow-2xl transition-transform duration-500 [transition-timing-function:var(--ease-silk)]",
              drawer.shown ? "translate-x-0" : "-translate-x-full",
            )}
            style={{ background: "var(--admin-canvas)" }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú del panel"
              className="admin-icon-btn absolute right-3 top-4 z-10"
            >
              <X className="size-4" strokeWidth={1.9} />
            </button>
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <main
          id="admin-contenido"
          className="admin-canvas-grid relative min-h-0 flex-1 px-4 pb-16 pt-7 md:px-7"
        >
          <div className="mx-auto flex w-full max-w-[86rem] flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

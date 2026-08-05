"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminThemeToggle } from "@/components/admin/theme";
import { Avatar } from "@/components/admin/ui";

/**
 * Barra superior: migas de pan a la izquierda, herramientas a la derecha.
 * Se queda pegada arriba porque en un panel el contexto ("dónde estoy") tiene
 * que estar disponible mientras recorres una tabla larga.
 */
export function AdminTopbar({
  collapsed,
  onToggleCollapse,
  onOpenMenu,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMenu: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-xl md:px-7"
      style={{
        borderColor: "var(--admin-line-soft)",
        background: "color-mix(in oklab, var(--admin-canvas) 78%, transparent)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="admin-icon-btn lg:hidden"
          aria-label="Abrir menú del panel"
        >
          <Menu className="size-[1.15rem]" strokeWidth={1.9} />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="admin-icon-btn max-lg:hidden"
          aria-label={collapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          aria-pressed={collapsed}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[1.15rem]" strokeWidth={1.9} />
          ) : (
            <PanelLeftClose className="size-[1.15rem]" strokeWidth={1.9} />
          )}
        </button>

        <span aria-hidden className="hidden h-6 w-px shrink-0 md:block" style={{ background: "var(--admin-line)" }} />

        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs />
        </div>

        {/* Buscador: presentacional mientras no exista backend */}
        <label className="relative hidden w-64 xl:block">
          <span className="sr-only">Buscar en el panel</span>
          <Search
            aria-hidden
            className="admin-muted pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
            strokeWidth={1.9}
          />
          <input
            type="search"
            placeholder="Buscar pedidos, productos…"
            className="admin-input pl-11"
          />
        </label>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="admin-icon-btn relative" aria-label="Notificaciones (3 sin leer)">
            <Bell className="size-[1.05rem]" strokeWidth={1.9} />
            <span
              aria-hidden
              className="absolute right-2 top-2 size-2 rounded-full bg-rose ring-2"
              style={{ ["--tw-ring-color" as string]: "var(--admin-canvas)" }}
            />
          </button>

          <AdminThemeToggle />

          <span aria-hidden className="hidden h-6 w-px shrink-0 sm:block" style={{ background: "var(--admin-line)" }} />

          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar initials="VC" tone="lavender" size="sm" />
            <span className="hidden leading-tight md:block">
              <span className="block font-display text-[0.82rem]">Valentina C.</span>
              <span className="admin-muted block text-[0.7rem]">Administradora</span>
            </span>
          </div>

          <Link href="/admin/login" className="admin-icon-btn" aria-label="Cerrar sesión">
            <LogOut className="size-[1.05rem]" strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </header>
  );
}

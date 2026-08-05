"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import { site } from "@/config/site";
import { adminNav } from "@/components/admin/nav";
import { cn } from "@/lib/utils";

/**
 * Barra lateral. Colapsa a solo iconos en escritorio y se convierte en cajón
 * deslizante en móvil; el mismo árbol sirve para los dos casos, así que no hay
 * dos navegaciones que mantener sincronizadas.
 */
export function AdminSidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Marca */}
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-transform duration-500 hover:scale-[1.02]",
          collapsed && "justify-center px-0",
        )}
        aria-label={`${site.name} — panel`}
      >
        {/* El logotipo es apaisado y no cabe en el riel de iconos: ahí usamos
            la marca cuadrada, que es la misma que lleva la pestaña. */}
        <Image
          src={collapsed ? "/icon.svg" : "/brand/logo-lo-mas-cute.png"}
          alt=""
          width={collapsed ? 64 : 120}
          height={collapsed ? 64 : 120}
          sizes="48px"
          className={collapsed ? "size-9 shrink-0 rounded-xl" : "h-10 w-auto shrink-0"}
        />
        {!collapsed && (
          <span className="min-w-0">
            <span className="admin-title block truncate text-[0.95rem] leading-tight">
              {site.name}
            </span>
            <span className="admin-muted block text-[0.68rem] uppercase tracking-[0.18em]">
              Panel
            </span>
          </span>
        )}
      </Link>

      {/* Secciones */}
      <nav aria-label="Secciones del panel" className="min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-6">
          {adminNav.map((group) => (
            <li key={group.label}>
              {!collapsed && (
                <p className="admin-eyebrow px-3 pb-2.5">{group.label}</p>
              )}
              {collapsed && <span className="admin-rule mx-2 mb-3 block" />}

              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        data-active={active}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "admin-nav-link",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        <item.icon
                          className="size-[1.15rem] shrink-0"
                          strokeWidth={active ? 2 : 1.8}
                        />
                        {!collapsed && (
                          <>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.badge ? (
                              <span className="tone-rose admin-pill admin-pill-plain px-2 py-0.5 text-[0.65rem]">
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                        {collapsed && item.badge ? (
                          <span
                            aria-hidden
                            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Pie */}
      <div className="flex flex-col gap-3">
        {/* En el cajón móvil estorba: ahí el espacio se lo quedan las secciones */}
        {!collapsed && (
          <div className="admin-inset hidden p-4 lg:block">
            <p className="flex items-center gap-2 font-display text-sm">
              <Sparkles className="size-3.5 text-gold" strokeWidth={2} />
              Modo demostración
            </p>
            <p className="admin-muted mt-1.5 text-xs leading-relaxed">
              Los datos son simulados. Todavía no hay base de datos conectada.
            </p>
          </div>
        )}

        <Link
          href="/"
          title={collapsed ? "Ver la tienda" : undefined}
          className={cn("admin-nav-link", collapsed && "justify-center px-0")}
        >
          <ExternalLink className="size-[1.15rem] shrink-0" strokeWidth={1.8} />
          {!collapsed && <span className="truncate">Ver la tienda</span>}
        </Link>
      </div>
    </div>
  );
}

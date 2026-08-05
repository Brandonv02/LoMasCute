"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { adminNavByHref } from "@/components/admin/nav";

/**
 * Migas de pan derivadas de la ruta. Los nombres bonitos salen del mismo
 * catálogo de navegación que usa el sidebar; para segmentos que no están ahí
 * (un id, un slug) se muestra el segmento tal cual, legible.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const prettify = (segment: string) => {
  // Un identificador no le dice nada a nadie, y partido en trozos por los
  // guiones queda peor todavía: en la ficha de un registro, "Editar".
  if (UUID.test(segment)) return "Editar";

  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // fuera "admin"

  const crumbs = segments.map((segment, i) => {
    const href = `/admin/${segments.slice(0, i + 1).join("/")}`;
    return { href, label: adminNavByHref.get(href)?.label ?? prettify(segment) };
  });

  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[0.82rem]">
        <li className="flex items-center">
          <Link
            href="/admin/dashboard"
            className="admin-muted transition-colors duration-400 hover:text-[var(--admin-ink)]"
            aria-label="Inicio del panel"
          >
            <Home className="size-3.5" strokeWidth={1.9} />
          </Link>
        </li>

        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="admin-muted size-3.5 shrink-0" strokeWidth={2} />
              {last ? (
                <span aria-current="page" className="truncate font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="admin-muted truncate transition-colors duration-400 hover:text-[var(--admin-ink)]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

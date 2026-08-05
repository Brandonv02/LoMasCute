"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "lmc.admin.theme";
const ATTR = "data-admin-theme";

/**
 * El proyecto público no tiene modo oscuro (está fijado a `colorScheme: light`),
 * así que el panel trae el suyo y lo mantiene encerrado: la marca vive en el
 * <html> mientras estás en /admin y se retira al salir, para que ninguna regla
 * pueda alcanzar la tienda.
 */

/** Se ejecuta antes de pintar: evita el parpadeo claro→oscuro al recargar. */
export const adminThemeScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("${ATTR}",t)}catch(e){}})()`;

export function AdminThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute(ATTR);
    setTheme(current === "dark" ? "dark" : "light");

    // Al abandonar el panel, el atributo se va con él.
    return () => document.documentElement.removeAttribute(ATTR);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute(ATTR, next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* almacenamiento bloqueado: el cambio dura lo que dure la visita */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`admin-icon-btn ${className ?? ""}`}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="size-[1.05rem]" strokeWidth={1.9} />
      ) : (
        <Moon className="size-[1.05rem]" strokeWidth={1.9} />
      )}
    </button>
  );
}

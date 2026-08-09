"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Panel } from "@/components/admin/ui";

/**
 * Pantalla de error del panel.
 *
 * Antes, cualquier fallo de la capa de datos —una clave mal puesta, una tabla
 * sin permisos— salía como la pantalla de error genérica de Next, sin decir qué
 * pasaba. El caso real fue `permission denied for table orders`: el panel
 * entraba a la base con la clave pública y Postgres cerraba la puerta.
 *
 * Los servicios ya traducen esos fallos a un mensaje accionable; aquí solo se
 * muestran con el vestido del panel, sin tumbar el resto de la navegación.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El detalle completo queda en el log del servidor, que es donde se mira
    // cuando esto pasa en producción.
    console.error("[admin]", error);
  }, [error]);

  return (
    <Panel className="admin-in">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="tone-rose grid size-14 place-items-center rounded-3xl">
          <AlertTriangle className="size-6" strokeWidth={1.7} />
        </span>

        <p className="admin-title mt-5 text-lg">No se pudo cargar esta sección</p>
        <p className="admin-soft mt-2 max-w-xl text-sm leading-relaxed">
          {error.message || "La base de datos no respondió como se esperaba."}
        </p>

        <button type="button" onClick={reset} className="admin-btn mt-6">
          <RotateCw className="size-4" strokeWidth={1.9} />
          Reintentar
        </button>

        {error.digest && (
          <p className="admin-muted mt-4 font-mono text-xs">ref: {error.digest}</p>
        )}
      </div>
    </Panel>
  );
}

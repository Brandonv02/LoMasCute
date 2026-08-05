import { cn } from "@/lib/utils";

/**
 * Tabla reutilizable del panel. Es Server Component, así que las columnas
 * pueden traer funciones `render` sin pagar hidratación: se resuelven en el
 * servidor y al navegador solo le llega el HTML.
 */

export type Column<T> = {
  key: string;
  header: string;
  /** Contenido de la celda. Por defecto, el valor de `key`. */
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
  /** Columnas secundarias que se esconden en pantallas pequeñas */
  hideBelow?: "sm" | "md" | "lg";
  className?: string;
};

const hideClass = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
} as const;

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  footer,
  /** Ancho mínimo antes de que la tabla empiece a desplazarse en horizontal.
      Las tablas dentro de una columna estrecha necesitan un valor menor. */
  minWidth = "44rem",
}: {
  columns: Column<T>[];
  rows: T[];
  caption: string;
  footer?: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div>
      <div className="-mx-6 overflow-x-auto">
        <table className="admin-table" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    column.align === "right" && "text-right",
                    column.hideBelow && hideClass[column.hideBelow],
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      column.align === "right" && "text-right",
                      column.hideBelow && hideClass[column.hideBelow],
                      column.className,
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="admin-muted flex flex-wrap items-center justify-between gap-3 pt-5 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
}

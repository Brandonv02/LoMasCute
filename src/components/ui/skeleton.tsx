import { cn } from "@/lib/utils";

/**
 * Estados de carga de Lo Más Cute.
 *
 * Todo lo de aquí es HTML y CSS: ni un componente de cliente, ni una librería
 * de animación, ni un `requestAnimationFrame`. Se envían cero kilobytes de
 * JavaScript, que es justo lo contrario de lo que suele pasar con los
 * skeletons.
 *
 * Reglas que sigue cada pieza:
 *
 *  · **La geometría manda.** Cada bloque copia el contenedor real —mismo
 *    `aspect`, mismo radio, mismos paddings y huecos— para que al llegar el
 *    contenido nada salte. Un skeleton que no mide lo mismo que su contenido
 *    es una fuente de CLS con buena intención.
 *  · **Un solo efecto.** El latido es una animación de `opacity` declarada una
 *    vez en `globals.css` (`.skeleton`). No hay brillo recorriendo, ni
 *    degradados en movimiento, ni desenfoques: eso cuesta repintados en cada
 *    fotograma y es lo que acabamos de quitar del móvil.
 *  · **Invisible para lectores de pantalla.** El contenedor lleva `aria-busy`
 *    y `aria-hidden` en las piezas: quien navega con lector oye "cargando",
 *    no una lista de cajas vacías.
 */

/** Bloque base. Todo lo demás se compone con esto. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton", className)} />;
}

/** Envoltorio que anuncia la espera una sola vez. */
export function SkeletonRegion({
  children,
  label = "Cargando",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- cabeceras */

/** Cabecera de página interna: miga, antetítulo, título y bajada. */
export function PageHeaderSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <header className="relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20">
      <div className="container-cute">
        <Skeleton className="h-4 w-40 rounded-full" />
        <div className="mt-6 max-w-3xl">
          <Skeleton className="h-6 w-32 rounded-full" />
          {/* Mismo alto que el h1 real: 2.3rem con interlineado 1.06 */}
          <Skeleton className="mt-5 h-[2.45rem] w-4/5 rounded-2xl md:h-[3.6rem]" />
          {lines > 1 && (
            <Skeleton className="mt-5 h-[1.6rem] w-full max-w-2xl rounded-2xl" />
          )}
        </div>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- catálogo */

/**
 * Tarjeta de producto: copia `ProductCard` bloque a bloque —arte 4/5,
 * subcategoría, nombre, bajada y fila de precio— para ocupar exactamente su
 * sitio.
 */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/62 ring-1 ring-white/75",
        className,
      )}
    >
      <Skeleton className="aspect-4/5 w-full rounded-none" />

      {/* Mismas filas que la card real —subcategoría, nombre, precio— con su
          mismo alto: medido, 120 px contra los 123 px del contenido real. */}
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-5 w-4/5 rounded-full" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Retícula de resultados: mismas columnas y huecos que la tienda. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Riel de la portada: una tarjeta y pico en móvil, más sus controles. */
export function ProductRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="relative">
      <ul className="grid grid-flow-col gap-5 [grid-auto-columns:minmax(0,86%)] sm:[grid-auto-columns:minmax(0,48%)] lg:[grid-auto-columns:minmax(0,31%)] xl:[grid-auto-columns:minmax(0,24%)]">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>

      <div className="mt-7 flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-2 rounded-full" />
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Explorador completo: barra de búsqueda, panel de filtros y retícula.
 *
 * `count` importa más de lo que parece. Este bloque también es el fallback del
 * `Suspense` que envuelve al explorador —que suspende en el servidor porque lee
 * la URL— así que se pinta en el HTML y se sustituye al hidratar. Si reserva
 * menos alto del que ocupará el catálogo, al cambiarlo la página crece de golpe
 * y eso es exactamente el salto que queremos evitar.
 */
export function ShopFiltersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <div className="sticky top-24 z-30 -mx-4 mb-10 px-4 md:-mx-6 md:px-6">
        <div className="glass flex flex-wrap items-center gap-3 rounded-[1.75rem] p-3">
          <Skeleton className="h-[3.25rem] w-full min-w-0 rounded-2xl sm:w-auto sm:flex-1" />
          <Skeleton className="h-[3.25rem] w-full rounded-2xl sm:w-44" />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="rounded-[1.75rem] bg-white/55 p-6 ring-1 ring-white/72">
            {Array.from({ length: 3 }).map((_, group) => (
              <div key={group} className={group ? "mt-8" : undefined}>
                <Skeleton className="h-4 w-28 rounded-full" />
                <div className="mt-4 flex flex-col gap-2.5">
                  {Array.from({ length: 4 }).map((_, row) => (
                    <Skeleton key={row} className="h-4 w-full rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <Skeleton className="mb-6 h-4 w-32 rounded-full" />
          <ProductGridSkeleton count={count} />
        </div>
      </div>
    </>
  );
}

/** Ficha de producto: galería a la izquierda, compra a la derecha. */
export function ProductDetailSkeleton() {
  return (
    <div className="container-cute">
      {/* Miga de pan */}
      <div className="pb-8 pt-10">
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Galería */}
        <div>
          <Skeleton className="aspect-4/5 w-full rounded-[2.5rem]" />
          <ul className="mt-4 flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex-1">
                <Skeleton className="aspect-square w-full rounded-3xl" />
              </li>
            ))}
          </ul>
        </div>

        {/* Compra */}
        <div>
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-[2.3rem] w-4/5 rounded-2xl md:h-[3rem]" />
          <Skeleton className="mt-2 h-5 w-2/5 rounded-full" />

          <Skeleton className="mt-5 h-5 w-40 rounded-full" />
          <Skeleton className="mt-7 h-[2.4rem] w-48 rounded-2xl" />

          <div className="mt-5 flex flex-col gap-2">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-11/12 rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
          </div>

          {/* Cantidad y botones */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Skeleton className="h-[3.25rem] w-36 rounded-full" />
            <Skeleton className="h-[3.25rem] min-w-[12rem] flex-1 rounded-full" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-[3.25rem] rounded-full" />
            <Skeleton className="h-[3.25rem] rounded-full" />
          </div>

          {/* Garantías */}
          <div className="mt-8 grid gap-2.5 rounded-[1.75rem] bg-white/58 p-5 ring-1 ring-white/75 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="size-9 shrink-0 rounded-2xl" />
                <span className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="mt-1.5 h-3 w-24 rounded-full" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ panel */

/** Tarjetas de cifras del panel. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="size-10 rounded-2xl" />
          </div>
          <Skeleton className="mt-4 h-7 w-24 rounded-full" />
          <Skeleton className="mt-2 h-3 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Cabecera del panel: antetítulo, título, bajada y acciones. */
export function AdminHeadingSkeleton() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="mt-2.5 h-8 w-56 rounded-2xl" />
        <Skeleton className="mt-2.5 h-4 w-72 max-w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}

/** Tabla del panel: cabecera y filas con el alto real. */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="admin-panel overflow-hidden">
      <div className="p-5">
        <Skeleton className="h-4 w-40 rounded-full" />
        <Skeleton className="mt-2 h-3 w-56 rounded-full" />
      </div>
      <div className="admin-rule" />
      <ul>
        {Array.from({ length: rows }).map((_, row) => (
          <li
            key={row}
            className="flex items-center gap-4 border-b px-5 py-4 last:border-0"
            style={{ borderColor: "var(--admin-line-soft)" }}
          >
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <span className="min-w-0 flex-1">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="mt-1.5 h-3 w-1/4 rounded-full" />
            </span>
            {Array.from({ length: Math.max(0, columns - 2) }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn(
                  "h-4 w-16 shrink-0 rounded-full",
                  col === 0 ? "hidden sm:block" : "hidden lg:block",
                )}
              />
            ))}
            <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Pantalla de panel completa: cabecera, cifras y tabla. */
export function DashboardSkeleton({
  stats = 4,
  rows = 6,
}: {
  stats?: number;
  rows?: number;
}) {
  return (
    <SkeletonRegion className="flex flex-col gap-6" label="Cargando el panel">
      <AdminHeadingSkeleton />
      <StatCardsSkeleton count={stats} />
      <TableSkeleton rows={rows} />
    </SkeletonRegion>
  );
}

/** Rejilla de tarjetas del panel (categorías, paneles de configuración). */
export function AdminCardsSkeleton({
  count = 6,
  className = "grid gap-5 md:grid-cols-2 xl:grid-cols-3",
  bodyHeight = "h-40",
}: {
  count?: number;
  className?: string;
  bodyHeight?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-panel overflow-hidden">
          <Skeleton className="aspect-[16/7] w-full rounded-none" />
          <div className={cn("flex flex-col gap-3 p-5", bodyHeight)}>
            <Skeleton className="h-5 w-1/2 rounded-full" />
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="mt-auto h-9 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

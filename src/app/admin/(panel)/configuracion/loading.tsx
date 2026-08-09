import {
  AdminHeadingSkeleton,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui/skeleton";

/**
 * Espera de Configuración: los seis paneles del formulario, con su alto real
 * para que al llegar los valores guardados la pantalla no dé un salto.
 */
export default function Loading() {
  return (
    <SkeletonRegion className="flex flex-col gap-8" label="Cargando la configuración">
      <AdminHeadingSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, panel) => (
          <div key={panel} className="admin-panel p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="mt-2 h-3 w-48 rounded-full" />
              </span>
              <Skeleton className="size-10 rounded-2xl" />
            </div>
            <div className="admin-rule mt-5" />
            <div className="mt-6 flex flex-col gap-5">
              {Array.from({ length: 3 }).map((_, field) => (
                <span key={field}>
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="mt-2 h-[3.25rem] w-full rounded-2xl" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

import {
  AdminCardsSkeleton,
  AdminHeadingSkeleton,
  Skeleton,
  SkeletonRegion,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";

/**
 * Espera de Categorías: cifras, el panel de alta y la rejilla de tarjetas,
 * que es la forma real de esta pantalla (no una tabla).
 */
export default function Loading() {
  return (
    <SkeletonRegion className="flex flex-col gap-6" label="Cargando las categorías">
      <AdminHeadingSkeleton />
      <StatCardsSkeleton count={4} />
      <div className="admin-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="mt-2 h-3 w-56 rounded-full" />
          </span>
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>
      <AdminCardsSkeleton count={3} />
    </SkeletonRegion>
  );
}

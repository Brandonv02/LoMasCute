import {
  ProductDetailSkeleton,
  ProductRailSkeleton,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui/skeleton";

/**
 * Espera de /producto/[slug]: la ficha con sus mismas proporciones —galería
 * 4/5, miniaturas, título, precio, descripción y botones— para que al llegar
 * el producto real no se mueva nada de sitio.
 *
 * Debajo va también el hueco de «También te puede encantar». No es decoración:
 * si esta pantalla mide menos que la definitiva, al relevarse el documento
 * crece y con él se desplaza el fondo, que está posicionado en porcentaje del
 * alto de la página. Reservar la sección es lo que evita ese salto.
 */
export default function Loading() {
  return (
    <SkeletonRegion label="Cargando el producto">
      <section className="pb-20">
        <ProductDetailSkeleton />
      </section>

      {/* Relacionados: mismo encabezado, mismo riel, mismos márgenes */}
      <section className="py-20 md:py-24">
        <div className="container-cute">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Skeleton className="h-7 w-40 rounded-full" />
              {/* El título real ocupa dos líneas en móvil y una en escritorio */}
              <Skeleton className="mt-5 h-[4.6rem] w-4/5 rounded-2xl md:h-[3.25rem]" />
            </div>
            <Skeleton className="h-[2.9rem] w-48 shrink-0 rounded-full" />
          </div>

          <div className="mt-12">
            <ProductRailSkeleton count={3} />
          </div>
        </div>
      </section>
    </SkeletonRegion>
  );
}

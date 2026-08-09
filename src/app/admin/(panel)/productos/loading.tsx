import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera del catálogo del panel: cuatro cifras y la tabla de productos. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={8} />;
}

import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera de Inventario: cifras de existencias y la tabla de referencias. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={8} />;
}

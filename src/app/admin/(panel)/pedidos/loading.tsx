import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera de Pedidos: cifras de ventas y la tabla de pedidos. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={6} />;
}

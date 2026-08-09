import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera de Clientes. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={4} />;
}

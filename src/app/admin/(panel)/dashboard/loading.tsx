import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera del dashboard: cifras del día y últimas ventas. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={5} />;
}

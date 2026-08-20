import { DashboardSkeleton } from "@/components/ui/skeleton";

/** Espera de Mensajes: las cifras de la bandeja y el listado. */
export default function Loading() {
  return <DashboardSkeleton stats={4} rows={6} />;
}

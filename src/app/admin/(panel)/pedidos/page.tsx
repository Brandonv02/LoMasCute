import type { Metadata } from "next";
import { CircleDollarSign, Clock, Download, Printer, ShoppingBag, Truck } from "lucide-react";
import {
  EmptyState,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  type Tone,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Pedidos" };

/**
 * Pedidos.
 *
 * Todavía no existe una tabla `orders`: el checkout no persiste nada, así que
 * aquí no hay ni un pedido que enseñar. La pantalla mantiene su estructura
 * —indicadores, reparto por estado y listado— pero ninguna cifra se inventa:
 * lo que no se puede medir se muestra como pendiente, no como cero fabricado.
 *
 * Cuando exista la tabla, esta página solo tiene que cambiar de fuente: el
 * diseño ya está resuelto.
 */

/**
 * Estados por los que pasa un pedido. Es configuración del dominio, no datos:
 * define el flujo que tendrá el módulo cuando haya pedidos de verdad.
 */
const ORDER_STATES: { key: string; label: string; tone: Tone }[] = [
  { key: "pendiente", label: "Esperan pago", tone: "gold" },
  { key: "pagado", label: "Pagados", tone: "mint" },
  { key: "empacando", label: "Empacando", tone: "lavender" },
  { key: "enviado", label: "En camino", tone: "peach" },
  { key: "entregado", label: "Entregados", tone: "mint" },
  { key: "cancelado", label: "Cancelados", tone: "neutral" },
];

export default function PedidosPage() {
  return (
    <>
      <PageHeading
        eyebrow="Ventas"
        title="Pedidos"
        description="Cada pedido, desde que entra hasta que llega a la puerta. Los pagos por Nequi y transferencia se confirman a mano."
        actions={
          <>
            <button type="button" className="admin-btn">
              <Printer className="size-4" strokeWidth={1.9} />
              Imprimir guías
            </button>
            <button type="button" className="admin-btn admin-btn-primary">
              <Download className="size-4" strokeWidth={1.9} />
              Exportar
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pedidos"
          value="—"
          icon={ShoppingBag}
          tone="lavender"
          hint="Sin pedidos registrados"
        />
        <StatCard
          label="Esperan pago"
          value="—"
          icon={Clock}
          tone="gold"
          hint="Sin pagos por confirmar"
          delay={0.05}
        />
        <StatCard
          label="En camino"
          value="—"
          icon={Truck}
          tone="peach"
          hint="Sin envíos en curso"
          delay={0.1}
        />
        <StatCard
          label="Facturado"
          value="—"
          icon={CircleDollarSign}
          tone="mint"
          hint="Sin ventas registradas"
          delay={0.15}
        />
      </div>

      {/* Estados */}
      <Panel className="admin-in">
        <PanelHeader title="Por estado" description="Dónde está atascado el flujo" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {ORDER_STATES.map((state) => (
            <li key={state.key} className="admin-inset p-4">
              <StatusPill tone={state.tone}>{state.label}</StatusPill>
              <p className="admin-title mt-3 text-2xl">—</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="admin-in">
        <PanelHeader
          title="Todos los pedidos"
          description="Ordenados del más reciente al más antiguo"
        />
        <EmptyState
          icon={ShoppingBag}
          title="Todavía no hay pedidos"
          description="En cuanto el checkout empiece a guardar los pedidos, aparecerán aquí con su clienta, su forma de pago, su estado y su total."
        />
      </Panel>
    </>
  );
}

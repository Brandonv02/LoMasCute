import type { Metadata } from "next";
import { CircleDollarSign, Clock, Download, Printer, ShoppingBag, Truck } from "lucide-react";
import {
  orders,
  orderStatus,
  revenueToday,
  shortDateTime,
  type OrderStatus,
} from "@/data/admin";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  Avatar,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  Toolbar,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Pedidos" };

type Row = (typeof orders)[number];

const columns: Column<Row>[] = [
  {
    key: "code",
    header: "Pedido",
    render: (order) => (
      <span className="flex flex-col gap-0.5">
        <span className="font-display text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
          {order.code}
        </span>
        <span className="admin-muted text-xs">
          {order.items} {order.items === 1 ? "artículo" : "artículos"}
        </span>
      </span>
    ),
  },
  {
    key: "customer",
    header: "Clienta",
    render: (order) => (
      <span className="flex items-center gap-2.5">
        <Avatar initials={order.initials} tone={order.tone} size="sm" />
        <span className="min-w-0">
          <span className="block truncate" style={{ color: "var(--admin-ink)" }}>
            {order.customer}
          </span>
          <span className="admin-muted block text-xs">{order.city}</span>
        </span>
      </span>
    ),
  },
  {
    key: "date",
    header: "Fecha",
    hideBelow: "md",
    render: (order) => shortDateTime(order.date),
  },
  {
    key: "payment",
    header: "Pago",
    hideBelow: "lg",
    render: (order) => <StatusPill tone="neutral" plain>{order.payment}</StatusPill>,
  },
  {
    key: "status",
    header: "Estado",
    render: (order) => (
      <StatusPill tone={orderStatus[order.status].tone}>
        {orderStatus[order.status].label}
      </StatusPill>
    ),
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    render: (order) => (
      <span className="font-display" style={{ color: "var(--admin-ink)" }}>
        {formatCOP(order.total)}
      </span>
    ),
  },
];

/** Resumen por estado: la primera lectura de un panel de pedidos */
const summary: { status: OrderStatus; label: string }[] = [
  { status: "pendiente", label: "Esperan pago" },
  { status: "pagado", label: "Pagados" },
  { status: "empacando", label: "Empacando" },
  { status: "enviado", label: "En camino" },
  { status: "entregado", label: "Entregados" },
  { status: "cancelado", label: "Cancelados" },
];

export default function PedidosPage() {
  const count = (status: OrderStatus) =>
    orders.filter((order) => order.status === status).length;

  const inTransit = count("empacando") + count("enviado");

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
        <StatCard label="Pedidos" value={String(orders.length)} icon={ShoppingBag} tone="lavender" hint="en el periodo" />
        <StatCard label="Esperan pago" value={String(count("pendiente"))} icon={Clock} tone="gold" hint="requieren confirmación" delay={0.05} />
        <StatCard label="En camino" value={String(inTransit)} icon={Truck} tone="peach" hint="empacando o enviados" delay={0.1} />
        <StatCard label="Facturado" value={formatCOP(revenueToday)} icon={CircleDollarSign} tone="mint" hint="sin cancelados" delay={0.15} />
      </div>

      {/* Estados */}
      <Panel className="admin-in">
        <PanelHeader title="Por estado" description="Dónde está atascado el flujo" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {summary.map((entry) => (
            <li key={entry.status} className="admin-inset p-4">
              <StatusPill tone={orderStatus[entry.status].tone}>{entry.label}</StatusPill>
              <p className="admin-title mt-3 text-2xl">{count(entry.status)}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="admin-in">
        <PanelHeader title="Todos los pedidos" description="Ordenados del más reciente al más antiguo" />

        <div className="mt-5">
          <Toolbar
            placeholder="Buscar por código, clienta o ciudad…"
            filters={["Todos", "Esperan pago", "Empacando", "Enviados"]}
          />
        </div>

        <div className="mt-6">
          <DataTable
            caption="Listado completo de pedidos"
            columns={columns}
            rows={orders}
            footer={
              <>
                <span>Mostrando {orders.length} de {orders.length} pedidos</span>
                <span>Periodo: últimos 7 días</span>
              </>
            }
          />
        </div>
      </Panel>
    </>
  );
}

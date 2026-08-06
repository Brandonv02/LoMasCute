import type { Metadata } from "next";
import Link from "next/link";
import { CircleDollarSign, Clock, Plus, ShoppingBag, Truck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/supabase/types";
import { ORDER_STATUSES } from "@/lib/supabase/types";
import { getOrderStats, listOrders, type Order } from "@/services/orders";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import {
  EmptyState,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  Toolbar,
} from "@/components/admin/ui";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABEL,
  saleDateTime,
} from "@/app/admin/(panel)/pedidos/order-meta";
import {
  OrderRowActions,
  OrderStatusSelect,
} from "@/app/admin/(panel)/pedidos/row-controls";

export const metadata: Metadata = { title: "Pedidos" };

// Las ventas se registran desde aquí mismo: nada que cachear entre visitas.
export const dynamic = "force-dynamic";

/**
 * Pedidos: las ventas registradas a mano.
 *
 * Los filtros viven en la URL, no en estado de cliente: así se pueden
 * compartir, volver atrás y recargar sin perder el contexto — la misma
 * decisión que en el catálogo de productos.
 */

const columns: Column<Order>[] = [
  {
    key: "code",
    header: "Venta",
    render: (order) => (
      <span className="flex flex-col gap-0.5">
        <span className="font-display text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
          {order.code}
        </span>
        <span className="admin-muted text-xs">
          {order.units} {order.units === 1 ? "artículo" : "artículos"}
        </span>
      </span>
    ),
  },
  {
    key: "customer",
    header: "Cliente",
    render: (order) => (
      <span className="min-w-0">
        <span className="block truncate" style={{ color: "var(--admin-ink)" }}>
          {order.customerName ?? "Sin nombre"}
        </span>
        <span className="admin-muted block truncate text-xs">
          {[order.customerCity, order.customerWhatsapp].filter(Boolean).join(" · ") ||
            "Sin datos de contacto"}
        </span>
      </span>
    ),
  },
  {
    key: "date",
    header: "Fecha",
    hideBelow: "md",
    render: (order) => saleDateTime(order.createdAt),
  },
  {
    key: "payment",
    header: "Pago",
    hideBelow: "lg",
    render: (order) => (
      <StatusPill tone="neutral" plain>
        {PAYMENT_METHOD_LABEL[order.paymentMethod]}
      </StatusPill>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (order) => <OrderStatusSelect id={order.id} status={order.status} />,
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
  {
    key: "actions",
    header: "Acciones",
    align: "right",
    render: (order) => <OrderRowActions id={order.id} code={order.code} />,
  },
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; eliminada?: string }>;
}) {
  const heading = (description: string) => (
    <PageHeading
      eyebrow="Ventas"
      title="Pedidos"
      description={description}
      actions={
        <Link href="/admin/pedidos/nueva" className="admin-btn admin-btn-primary">
          <Plus className="size-4" strokeWidth={2} />
          Nueva venta
        </Link>
      }
    />
  );

  if (!isSupabaseConfigured()) {
    return (
      <>
        {heading("Las ventas registradas a mano, con su estado y su detalle.")}
        <SupabaseSetupNotice what="El registro de ventas" />
      </>
    );
  }

  const params = await searchParams;
  const status = (params.estado ?? "all") as OrderStatus | "all";

  const [orders, stats] = await Promise.all([
    listOrders({ search: params.q, status }),
    getOrderStats(),
  ]);

  const filtered = Boolean(params.q) || status !== "all";
  const inTransit = stats.byStatus.pagado + stats.byStatus.entregado;

  /** Cambia un filtro conservando los demás */
  const hrefWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: params.q, estado: params.estado, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all") next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/pedidos?${query}` : "/admin/pedidos";
  };

  return (
    <>
      {heading(
        "Cada venta registrada a mano, con su detalle y su estado. Al guardarla se descuenta el stock; al eliminarla, vuelve.",
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas"
          value={String(stats.total)}
          icon={ShoppingBag}
          tone="lavender"
          hint="registradas"
        />
        <StatCard
          label="Pendientes"
          value={String(stats.byStatus.pendiente)}
          icon={Clock}
          tone="gold"
          hint="esperan confirmación"
          delay={0.05}
        />
        <StatCard
          label="Pagadas o entregadas"
          value={String(inTransit)}
          icon={Truck}
          tone="peach"
          hint="cerradas con éxito"
          delay={0.1}
        />
        <StatCard
          label="Facturado"
          value={formatCOP(stats.revenue)}
          icon={CircleDollarSign}
          tone="mint"
          hint="sin canceladas"
          delay={0.15}
        />
      </div>

      {params.eliminada && (
        <div
          role="status"
          className="tone-mint admin-in flex items-center gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          Venta eliminada. El stock volvió al inventario.
        </div>
      )}

      {/* Estados */}
      <Panel className="admin-in">
        <PanelHeader title="Por estado" description="Dónde está atascado el flujo" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ORDER_STATUSES.map((option) => (
            <li key={option}>
              <Link
                href={hrefWith({ estado: status === option ? "all" : option })}
                className="admin-inset block p-4 transition-opacity duration-300 hover:opacity-80"
              >
                <StatusPill tone={ORDER_STATUS_META[option].tone}>
                  {ORDER_STATUS_META[option].label}
                </StatusPill>
                <p className="admin-title mt-3 text-2xl">{stats.byStatus[option]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="admin-in">
        <PanelHeader
          title="Todas las ventas"
          description="Ordenadas de la más reciente a la más antigua"
        />

        <form className="mt-5" method="get">
          <Toolbar
            placeholder="Buscar por cliente, WhatsApp, ciudad o código…"
            name="q"
            defaultValue={params.q}
          >
            {status !== "all" && <input type="hidden" name="estado" value={status} />}
          </Toolbar>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", ...ORDER_STATUSES] as const).map((option) => (
            <Link
              key={option}
              href={hrefWith({ estado: option })}
              className={`admin-btn px-4 py-2 text-[0.82rem] ${status === option ? "admin-btn-primary" : ""}`}
            >
              {option === "all" ? "Todas" : ORDER_STATUS_META[option].label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title={filtered ? "Nada con ese filtro" : "Todavía no hay ventas"}
              description={
                filtered
                  ? "Prueba con otra búsqueda o quita los filtros."
                  : "Registra la primera venta hecha por WhatsApp, en persona o por redes: se guardará con su detalle y descontará el stock."
              }
              action={
                filtered ? (
                  <Link href="/admin/pedidos" className="admin-btn">
                    Quitar filtros
                  </Link>
                ) : (
                  <Link
                    href="/admin/pedidos/nueva"
                    className="admin-btn admin-btn-primary"
                  >
                    <Plus className="size-4" strokeWidth={2} />
                    Nueva venta
                  </Link>
                )
              }
            />
          ) : (
            <DataTable
              caption="Listado completo de ventas"
              columns={columns}
              rows={orders}
              minWidth="52rem"
              footer={
                <>
                  <span>
                    Mostrando {orders.length} de {stats.total}{" "}
                    {stats.total === 1 ? "venta" : "ventas"}
                  </span>
                  <span>Facturado: {formatCOP(stats.revenue)}</span>
                </>
              }
            />
          )}
        </div>
      </Panel>
    </>
  );
}

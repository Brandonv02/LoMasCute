import type { Metadata } from "next";
import Link from "next/link";
import {
  BellOff,
  CircleDollarSign,
  Clock,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { isAdminConfigured } from "@/lib/supabase/client";
import { isEmailConfigured } from "@/lib/email";
import type { OrderChannel, OrderStatus } from "@/lib/supabase/types";
import { ORDER_CHANNELS, ORDER_STATUSES } from "@/lib/supabase/types";
import { getOrderStats, listOrders, type Order } from "@/services/orders";
import { messageFor } from "@/services/errors";
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
  ORDER_CHANNEL_META,
  ORDER_STATUS_META,
  paymentName,
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
    key: "channel",
    header: "Origen",
    hideBelow: "md",
    render: (order) => (
      <StatusPill tone={ORDER_CHANNEL_META[order.channel].tone}>
        {ORDER_CHANNEL_META[order.channel].short}
      </StatusPill>
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
          {[
            order.customerEmail,
            order.shippingNeighborhood ?? order.customerCity,
            order.customerWhatsapp,
          ]
            .filter(Boolean)
            .join(" · ") || "Sin datos de contacto"}
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
        {paymentName(order)}
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
  searchParams: Promise<{
    q?: string;
    estado?: string;
    canal?: string;
    eliminada?: string;
  }>;
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

  if (!isAdminConfigured()) {
    return (
      <>
        {heading("Los pedidos de la tienda y las ventas registradas a mano.")}
        <SupabaseSetupNotice what="El registro de pedidos" />
      </>
    );
  }

  const params = await searchParams;
  const status = (params.estado ?? "all") as OrderStatus | "all";
  const channel = (params.canal ?? "all") as OrderChannel | "all";

  /**
   * Si la base rechaza la lectura, el panel lo cuenta en vez de caerse.
   *
   * `orders` es privada a propósito: solo la abre la clave `service_role` desde
   * el servidor. Cuando ese acceso falla —clave pública en la variable, clave
   * rotada que el despliegue no tiene— el error dice qué arreglar; una pantalla
   * de error genérica, no.
   */
  let orders: Order[];
  let stats: Awaited<ReturnType<typeof getOrderStats>>;

  try {
    [orders, stats] = await Promise.all([
      listOrders({ search: params.q, status, channel }),
      getOrderStats(),
    ]);
  } catch (error) {
    return (
      <>
        {heading("Los pedidos de la tienda y las ventas registradas a mano.")}
        <Panel className="admin-in">
          <EmptyState
            icon={ShoppingBag}
            title="No se pudieron leer los pedidos"
            description={messageFor(error)}
          />
        </Panel>
      </>
    );
  }

  const filtered = Boolean(params.q) || status !== "all" || channel !== "all";
  const inTransit = stats.byStatus.pagado + stats.byStatus.entregado;

  /** Cambia un filtro conservando los demás */
  const hrefWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      q: params.q,
      estado: params.estado,
      canal: params.canal,
      ...patch,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all") next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/pedidos?${query}` : "/admin/pedidos";
  };

  return (
    <>
      {heading(
        "Los pedidos que llegan de la tienda y las ventas registradas a mano. Un pedido en pendiente todavía no toca el inventario: el stock se descuenta al pasarlo a pagado o entregado, y vuelve al cancelarlo.",
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
          label="Pedidos web por confirmar"
          value={String(stats.pendingOnline)}
          icon={Clock}
          tone="gold"
          hint="sin descontar stock"
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
          hint="pagado y entregado"
          delay={0.15}
        />
      </div>

      {/*
        Silencio que parece normalidad.
        Si entran pedidos web y no hay proveedor de correo, nadie recibe el
        aviso y desde fuera se ve igual que "no ha llegado nada". Se dice aqui,
        y solo cuando ya hay pedidos web: a una tienda que todavia no vende en
        linea no hay por que darle la lata.
      */}
      {stats.byChannel.online > 0 && !isEmailConfigured() && (
        <div
          role="status"
          className="tone-gold admin-in flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <BellOff className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>
            Los pedidos de la tienda <strong>no te avisan por correo</strong>:
            falta <code className="font-mono text-[0.9em]">RESEND_API_KEY</code>{" "}
            en el entorno. Los pedidos se guardan igual y aparecen en esta lista,
            pero hay que entrar a mirar.
          </span>
        </div>
      )}

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
          title="Todos los pedidos"
          description="Ordenados del más reciente al más antiguo"
        />

        <form className="mt-5" method="get">
          <Toolbar
            placeholder="Buscar por cliente, correo, WhatsApp, dirección o código…"
            name="q"
            defaultValue={params.q}
          >
            {status !== "all" && <input type="hidden" name="estado" value={status} />}
            {channel !== "all" && <input type="hidden" name="canal" value={channel} />}
          </Toolbar>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", ...ORDER_CHANNELS] as const).map((option) => (
            <Link
              key={option}
              href={hrefWith({ canal: option })}
              className={`admin-btn px-4 py-2 text-[0.82rem] ${channel === option ? "admin-btn-primary" : ""}`}
            >
              {option === "all" ? "Todo origen" : ORDER_CHANNEL_META[option].label}
            </Link>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
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
              title={filtered ? "Nada con ese filtro" : "Todavía no hay pedidos"}
              description={
                filtered
                  ? "Prueba con otra búsqueda o quita los filtros."
                  : "Aquí caerán los pedidos que se hagan desde la tienda. También puedes registrar a mano una venta hecha por WhatsApp o en persona."
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
              caption="Listado completo de pedidos"
              columns={columns}
              rows={orders}
              minWidth="58rem"
              footer={
                <>
                  <span>
                    Mostrando {orders.length} de {stats.total}{" "}
                    {stats.total === 1 ? "pedido" : "pedidos"}
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

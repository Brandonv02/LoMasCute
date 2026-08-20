import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  Gift,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  User,
} from "lucide-react";
import { isAdminConfigured } from "@/lib/supabase/client";
import { getOrder } from "@/services/orders";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import { PageHeading, Panel, PanelHeader, StatusPill } from "@/components/admin/ui";
import {
  ORDER_CHANNEL_META,
  ORDER_STATUS_META,
  paymentName,
  saleDateTime,
} from "@/app/admin/(panel)/pedidos/order-meta";
import {
  DeleteOrderButton,
  OrderStatusSelect,
} from "@/app/admin/(panel)/pedidos/row-controls";
import type { OrderItem } from "@/services/orders";

export const metadata: Metadata = { title: "Detalle del pedido" };
export const dynamic = "force-dynamic";

/** Fila de dato: etiqueta a la izquierda, valor a la derecha */
function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof User;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 py-3.5">
      <p
        className="flex items-center gap-2 text-[0.9rem]"
        style={{ color: "var(--admin-ink)" }}
      >
        {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.9} />}
        {label}
      </p>
      <div className="admin-soft min-w-0 text-right text-[0.9rem]">{value}</div>
    </div>
  );
}

const columns: Column<OrderItem>[] = [
  {
    key: "product",
    header: "Producto",
    render: (item) => (
      <span className="min-w-0">
        <span
          className="block truncate font-display text-[0.92rem]"
          style={{ color: "var(--admin-ink)" }}
        >
          {item.productName}
        </span>
        {item.shade && (
          <span className="admin-muted block truncate text-xs">
            Tono: {item.shade}
          </span>
        )}
        {!item.productId && (
          <span className="admin-muted block text-xs">
            Ya no está en el catálogo
          </span>
        )}
      </span>
    ),
  },
  {
    key: "unitPrice",
    header: "Precio",
    align: "right",
    hideBelow: "sm",
    render: (item) => formatCOP(item.unitPrice),
  },
  {
    key: "quantity",
    header: "Cantidad",
    align: "right",
    render: (item) => `${item.quantity} uds.`,
  },
  {
    key: "subtotal",
    header: "Subtotal",
    align: "right",
    render: (item) => (
      <span className="font-display" style={{ color: "var(--admin-ink)" }}>
        {formatCOP(item.subtotal)}
      </span>
    ),
  },
];

export default async function DetalleVentaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creada?: string }>;
}) {
  if (!isAdminConfigured()) {
    return (
      <>
        <PageHeading eyebrow="Ventas · Pedidos" title="Detalle del pedido" />
        <SupabaseSetupNotice what="El detalle del pedido" />
      </>
    );
  }

  const { id } = await params;
  const { creada } = await searchParams;

  const order = await getOrder(id);
  if (!order) notFound();

  const status = ORDER_STATUS_META[order.status];
  const origin = ORDER_CHANNEL_META[order.channel];
  const isOnline = order.channel === "online";

  return (
    <>
      <PageHeading
        eyebrow="Ventas · Pedidos"
        title={order.code}
        description={`${origin.label} · ${saleDateTime(order.createdAt)}.`}
        actions={
          <>
            <Link href="/admin/pedidos" className="admin-btn">
              <ArrowLeft className="size-4" strokeWidth={1.9} />
              Volver
            </Link>
            <DeleteOrderButton id={order.id} code={order.code} />
          </>
        }
      />

      {creada && (
        <div
          role="status"
          className="tone-mint admin-in flex items-center gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <CircleCheck className="size-4 shrink-0" strokeWidth={2} />
          {order.stockHeld
            ? "Venta registrada. El stock ya se descontó del inventario."
            : "Venta registrada en pendiente. El stock no se ha descontado: pásala a pagado cuando se cobre."}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Detalle */}
        <Panel className="admin-in">
          <PanelHeader
            title="Productos"
            description={`${order.itemCount} ${order.itemCount === 1 ? "referencia" : "referencias"} · ${order.units} ${order.units === 1 ? "unidad" : "unidades"}`}
            action={<StatusPill tone={status.tone}>{status.label}</StatusPill>}
          />

          <div className="mt-5">
            <DataTable
              caption={`Productos del pedido ${order.code}`}
              columns={columns}
              rows={order.items}
              minWidth="30rem"
            />
          </div>

          <div className="admin-rule my-6" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="admin-soft">Productos</dt>
              <dd style={{ color: "var(--admin-ink)" }}>
                {formatCOP(order.itemsTotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="admin-soft flex items-center gap-2">
                <Truck className="size-3.5" strokeWidth={1.9} />
                Domicilio
              </dt>
              <dd style={{ color: "var(--admin-ink)" }}>
                {order.shippingCost === 0 ? "Gratis" : formatCOP(order.shippingCost)}
              </dd>
            </div>
            <div className="admin-rule my-3" />
            <div className="flex items-end justify-between gap-4">
              <span>
                <span className="admin-eyebrow block">Total del pedido</span>
                <span className="admin-muted mt-1 block text-xs">
                  {paymentName(order)}
                </span>
              </span>
              <span className="admin-title text-[1.8rem] leading-none">
                {formatCOP(order.total)}
              </span>
            </div>
          </dl>
        </Panel>

        <div className="flex flex-col gap-6">
          {/* Cliente */}
          <Panel className="admin-in">
            <PanelHeader
              title="Cliente"
              description={
                isOnline
                  ? "Lo que escribió al hacer el pedido"
                  : "Lo que se registró al vender"
              }
            />
            <div className="admin-rule mt-5" />
            <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
              <Row
                icon={User}
                label="Nombre"
                value={order.customerName ?? <span className="admin-muted">—</span>}
              />
              <Row
                icon={MessageCircle}
                label="WhatsApp"
                value={
                  order.customerWhatsapp ? (
                    <a
                      href={`https://wa.me/${order.customerWhatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      {order.customerWhatsapp}
                    </a>
                  ) : (
                    <span className="admin-muted">—</span>
                  )
                }
              />
              {order.customerEmail && (
                <Row
                  icon={Mail}
                  label="Correo"
                  value={
                    <a
                      href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Tu pedido ${order.code}`)}`}
                      className="underline underline-offset-4"
                    >
                      {order.customerEmail}
                    </a>
                  }
                />
              )}
              {order.shippingAddress && (
                <Row icon={MapPin} label="Dirección" value={order.shippingAddress} />
              )}
              <Row
                icon={MapPin}
                label={order.shippingNeighborhood ? "Barrio y ciudad" : "Ciudad"}
                value={
                  [order.shippingNeighborhood, order.customerCity]
                    .filter(Boolean)
                    .join(" · ") || <span className="admin-muted">—</span>
                }
              />
              {order.isGift && (
                <Row
                  icon={Gift}
                  label="Es un regalo"
                  value="Tarjeta escrita a mano, sin factura dentro"
                />
              )}
            </div>
          </Panel>

          {/* Venta */}
          <Panel className="admin-in">
            <PanelHeader title="Pedido" description="Estado y condiciones" />
            <div className="admin-rule mt-5" />
            <div className="divide-y" style={{ borderColor: "var(--admin-line-soft)" }}>
              <Row
                label="Estado"
                value={<OrderStatusSelect id={order.id} status={order.status} />}
              />
              <Row
                label="Inventario"
                value={
                  order.stockHeld ? (
                    "Descontado del stock"
                  ) : (
                    <span className="admin-muted">
                      Sin descontar — se descuenta al pasar a pagado
                    </span>
                  )
                }
              />
              <Row label="Origen" value={origin.label} />
              <Row label="Método de pago" value={paymentName(order)} />
              <Row label="Registrado" value={saleDateTime(order.createdAt)} />
              {order.updatedAt !== order.createdAt && (
                <Row label="Último cambio" value={saleDateTime(order.updatedAt)} />
              )}
            </div>

            {order.notes && (
              <>
                <div className="admin-rule my-5" />
                <p className="admin-eyebrow">Notas</p>
                <p className="admin-soft mt-2 whitespace-pre-line text-sm leading-relaxed">
                  {order.notes}
                </p>
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

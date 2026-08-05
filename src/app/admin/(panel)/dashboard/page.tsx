import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  Check,
  CircleDollarSign,
  Eye,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  activity,
  bestSelling,
  customers,
  lowStock,
  orders,
  orderStatus,
  ordersTrend,
  revenueToday,
  salesTrend,
  shortTime,
  tasks,
  ticketTrend,
  visitsTrend,
} from "@/data/admin";
import { products } from "@/data/products";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  Avatar,
  Meter,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

type Row = (typeof orders)[number];

const columns: Column<Row>[] = [
  {
    key: "code",
    header: "Pedido",
    render: (order) => (
      <span className="font-display text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
        {order.code}
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
    header: "Hora",
    hideBelow: "lg",
    render: (order) => shortTime(order.date),
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

export default function DashboardPage() {
  const pending = orders.filter((order) => order.status === "pendiente").length;
  const done = tasks.filter((task) => task.done).length;

  return (
    <>
      <PageHeading
        eyebrow="Hoy, 4 de agosto"
        title="Buenos días, Valentina ✿"
        description={`${pending} pedidos esperan confirmación de pago y ${lowStock.length} productos están por agotarse. El resto va sobre ruedas.`}
        actions={
          <>
            <Link href="/admin/pedidos" className="admin-btn">
              <ShoppingBag className="size-4" strokeWidth={1.9} />
              Ver pedidos
            </Link>
            <Link href="/admin/inventario" className="admin-btn admin-btn-primary">
              <Boxes className="size-4" strokeWidth={1.9} />
              Revisar inventario
            </Link>
          </>
        }
      />

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas del día"
          value={formatCOP(revenueToday)}
          icon={CircleDollarSign}
          tone="rose"
          delta={18}
          hint="vs. ayer"
          trend={salesTrend}
          delay={0}
        />
        <StatCard
          label="Pedidos"
          value={String(orders.length)}
          icon={ShoppingBag}
          tone="lavender"
          delta={12}
          hint="últimas 24 h"
          trend={ordersTrend}
          delay={0.05}
        />
        <StatCard
          label="Visitas a la tienda"
          value="1.284"
          icon={Eye}
          tone="mint"
          delta={9}
          hint="vs. semana pasada"
          trend={visitsTrend}
          delay={0.1}
        />
        <StatCard
          label="Ticket promedio"
          value={formatCOP(Math.round(revenueToday / orders.length))}
          icon={Users}
          tone="gold"
          delta={-3}
          hint="vs. semana pasada"
          trend={ticketTrend}
          delay={0.15}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Pedidos recientes */}
        <Panel className="admin-in">
          <PanelHeader
            title="Pedidos recientes"
            description="Lo último que entró por la tienda"
            action={
              <Link href="/admin/pedidos" className="admin-btn px-4 py-2 text-[0.82rem]">
                Ver todos
                <ArrowUpRight className="size-3.5" strokeWidth={2} />
              </Link>
            }
          />
          <div className="mt-5">
            <DataTable
              caption="Pedidos recientes de la tienda"
              columns={columns}
              rows={orders.slice(0, 6)}
              minWidth="30rem"
              footer={
                <>
                  <span>Mostrando 6 de {orders.length} pedidos</span>
                  <span>Actualizado hace un momento</span>
                </>
              }
            />
          </div>
        </Panel>

        {/* Actividad */}
        <Panel className="admin-in">
          <PanelHeader title="Actividad" description="Lo que ha pasado hoy" />
          <ul className="mt-5 flex flex-col">
            {activity.map((item, i) => (
              <li key={item.id} className="flex gap-3.5 pb-5 last:pb-0">
                <span className="flex flex-col items-center">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full tone-${item.tone}`}>
                    <span className="sr-only">•</span>
                  </span>
                  {i < activity.length - 1 && (
                    <span
                      aria-hidden
                      className="mt-1 w-px flex-1"
                      style={{ background: "var(--admin-line)" }}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
                    {item.text}
                  </span>
                  <span className="admin-muted block truncate text-xs">{item.detail}</span>
                  <span className="admin-muted block pt-0.5 text-[0.7rem]">{item.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        {/* Más vendidos */}
        <Panel className="admin-in">
          <PanelHeader
            title="Más vendidos"
            description="Últimos 30 días"
            action={
              <Link href="/admin/productos" className="admin-btn px-4 py-2 text-[0.82rem]">
                Catálogo
              </Link>
            }
          />
          <ul className="mt-5 flex flex-col gap-4">
            {bestSelling.slice(0, 5).map((product) => (
              <li key={product.id} className="flex items-center gap-3.5">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[0.9rem]"
                    style={{ color: "var(--admin-ink)" }}
                  >
                    {product.name}
                  </span>
                  <Meter value={product.share} className="mt-2" />
                </span>
                <span className="shrink-0 text-right">
                  <span className="admin-title block text-sm">{product.units}</span>
                  <span className="admin-muted block text-[0.7rem]">uds.</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Stock bajo */}
        <Panel className="admin-in">
          <PanelHeader
            title="Por reponer"
            description={`${lowStock.length} productos bajo el umbral`}
            action={
              <Link href="/admin/inventario" className="admin-btn px-4 py-2 text-[0.82rem]">
                Inventario
              </Link>
            }
          />
          <ul className="mt-5 flex flex-col gap-3.5">
            {lowStock.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center gap-3.5">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[0.9rem]"
                    style={{ color: "var(--admin-ink)" }}
                  >
                    {item.name}
                  </span>
                  <span className="admin-muted block text-xs">{item.subcategory}</span>
                </span>
                <StatusPill tone={item.stock === 0 ? "neutral" : item.stock <= 6 ? "rose" : "gold"}>
                  {item.stock === 0 ? "Agotado" : `${item.stock} uds.`}
                </StatusPill>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Tareas */}
        <Panel className="admin-in">
          <PanelHeader title="Tu día" description={`${done} de ${tasks.length} listas`} />
          <Meter value={(done / tasks.length) * 100} tone="mint" className="mt-5" />
          <ul className="mt-5 flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-lg ${
                    task.done ? "tone-mint" : "tone-neutral"
                  }`}
                >
                  {task.done && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span
                  className={`text-[0.88rem] leading-snug ${task.done ? "admin-muted line-through" : "admin-soft"}`}
                >
                  {task.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="admin-rule my-6" />

          <dl className="grid grid-cols-2 gap-4 text-center">
            <div>
              <dt className="admin-eyebrow">Productos</dt>
              <dd className="admin-title mt-1.5 text-xl">{products.length}</dd>
            </div>
            <div>
              <dt className="admin-eyebrow">Clientas</dt>
              <dd className="admin-title mt-1.5 text-xl">{customers.length}</dd>
            </div>
          </dl>

          <Link href="/admin/productos" className="admin-btn mt-6 w-full">
            <Package className="size-4" strokeWidth={1.9} />
            Ir al catálogo
          </Link>
        </Panel>
      </div>
    </>
  );
}

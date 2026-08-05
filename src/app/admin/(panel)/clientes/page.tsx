import type { Metadata } from "next";
import { Heart, Mail, Repeat, UserPlus, Users } from "lucide-react";
import { customers, shortDate } from "@/data/admin";
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
  Toolbar,
  type Tone,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Clientes" };

type Row = (typeof customers)[number];

const tierTone: Record<Row["tier"], Tone> = {
  "Club Cute": "rose",
  Recurrente: "lavender",
  Nueva: "mint",
};

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "Clienta",
    render: (customer) => (
      <span className="flex items-center gap-3">
        <Avatar initials={customer.initials} tone={customer.tone} />
        <span className="min-w-0">
          <span className="block truncate font-display text-[0.92rem]" style={{ color: "var(--admin-ink)" }}>
            {customer.name}
          </span>
          <span className="admin-muted block truncate text-xs">{customer.email}</span>
        </span>
      </span>
    ),
  },
  { key: "city", header: "Ciudad", hideBelow: "md" },
  {
    key: "tier",
    header: "Nivel",
    hideBelow: "sm",
    render: (customer) => (
      <StatusPill tone={tierTone[customer.tier]}>{customer.tier}</StatusPill>
    ),
  },
  {
    key: "orders",
    header: "Pedidos",
    align: "right",
    render: (customer) => (
      <span style={{ color: "var(--admin-ink)" }}>{customer.orders}</span>
    ),
  },
  {
    key: "lastOrder",
    header: "Última compra",
    align: "right",
    hideBelow: "lg",
    render: (customer) => shortDate(customer.lastOrder),
  },
  {
    key: "spent",
    header: "Total gastado",
    align: "right",
    render: (customer) => (
      <span className="font-display" style={{ color: "var(--admin-ink)" }}>
        {formatCOP(customer.spent)}
      </span>
    ),
  },
];

export default function ClientesPage() {
  const recurring = customers.filter((customer) => customer.orders > 1).length;
  const club = customers.filter((customer) => customer.tier === "Club Cute").length;
  const spent = customers.reduce((sum, customer) => sum + customer.spent, 0);
  const top = [...customers].sort((a, b) => b.spent - a.spent).slice(0, 5);
  const max = top[0]?.spent ?? 1;

  return (
    <>
      <PageHeading
        eyebrow="Ventas"
        title="Clientes"
        description="Quién compra en Lo Más Cute, cada cuánto vuelve y cuánto vale esa relación."
        actions={
          <>
            <button type="button" className="admin-btn">
              <Mail className="size-4" strokeWidth={1.9} />
              Enviar boletín
            </button>
            <button type="button" className="admin-btn admin-btn-primary">
              <UserPlus className="size-4" strokeWidth={2} />
              Agregar clienta
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientas" value={String(customers.length)} icon={Users} tone="lavender" hint="registradas" />
        <StatCard label="Recurrentes" value={String(recurring)} icon={Repeat} tone="mint" delta={14} hint="más de una compra" delay={0.05} />
        <StatCard label="Club Cute" value={String(club)} icon={Heart} tone="rose" hint="programa de fidelidad" delay={0.1} />
        <StatCard label="Valor total" value={formatCOP(spent)} icon={Users} tone="gold" hint="histórico" delay={0.15} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="admin-in">
          <PanelHeader title="Todas las clientas" description="Ordenadas por actividad reciente" />

          <div className="mt-5">
            <Toolbar
              placeholder="Buscar por nombre, correo o ciudad…"
              filters={["Todas", "Club Cute", "Recurrentes", "Nuevas"]}
            />
          </div>

          <div className="mt-6">
            <DataTable
              caption="Listado de clientas"
              columns={columns}
              rows={customers}
              footer={
                <>
                  <span>Mostrando {customers.length} de {customers.length} clientas</span>
                  <span>Datos simulados</span>
                </>
              }
            />
          </div>
        </Panel>

        <Panel className="admin-in">
          <PanelHeader title="Las que más compran" description="Por total gastado" />
          <ul className="mt-5 flex flex-col gap-5">
            {top.map((customer, i) => (
              <li key={customer.id} className="flex items-center gap-3.5">
                <span className="admin-muted w-4 shrink-0 text-center font-display text-sm">
                  {i + 1}
                </span>
                <Avatar initials={customer.initials} tone={customer.tone} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9rem]" style={{ color: "var(--admin-ink)" }}>
                    {customer.name}
                  </span>
                  <Meter value={(customer.spent / max) * 100} tone={customer.tone} className="mt-2" />
                </span>
                <span className="admin-title shrink-0 text-right text-sm">
                  {formatCOP(customer.spent)}
                </span>
              </li>
            ))}
          </ul>

          <div className="admin-rule my-6" />

          <PanelHeader title="Reparto por nivel" />
          <ul className="mt-4 flex flex-col gap-3">
            {(["Club Cute", "Recurrente", "Nueva"] as const).map((tier) => {
              const items = customers.filter((customer) => customer.tier === tier);
              return (
                <li key={tier} className="flex items-center gap-3">
                  <StatusPill tone={tierTone[tier]}>{tier}</StatusPill>
                  <Meter
                    value={(items.length / customers.length) * 100}
                    tone={tierTone[tier]}
                    className="flex-1"
                  />
                  <span className="admin-muted w-8 shrink-0 text-right text-xs">
                    {items.length}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

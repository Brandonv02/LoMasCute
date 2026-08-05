import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle, Boxes, PackageCheck, PackageX, Truck } from "lucide-react";
import {
  LOW_STOCK,
  inventory,
  lowStock,
  outOfStock,
  stockState,
} from "@/data/admin";
import { categories } from "@/data/categories";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import {
  EmptyState,
  Meter,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
  Toolbar,
  type Tone,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Inventario" };

type Row = (typeof inventory)[number];

const categoryName = (slug: string) =>
  categories.find((category) => category.slug === slug)?.name ?? slug;

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "Producto",
    render: (item) => (
      <span className="flex items-center gap-3.5">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
          <Image src={item.image} alt="" fill loading="lazy" sizes="44px" className="object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-[0.92rem]" style={{ color: "var(--admin-ink)" }}>
            {item.name}
          </span>
          <span className="admin-muted block truncate text-xs">{item.subcategory}</span>
        </span>
      </span>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    hideBelow: "lg",
    render: (item) => <span className="admin-muted font-mono text-xs">{item.id.toUpperCase()}</span>,
  },
  {
    key: "category",
    header: "Categoría",
    hideBelow: "md",
    render: (item) => categoryName(item.category),
  },
  {
    key: "reserved",
    header: "Reservado",
    align: "right",
    hideBelow: "lg",
    render: (item) => `${item.reserved} uds.`,
  },
  {
    key: "stock",
    header: "Existencias",
    align: "right",
    render: (item) => {
      const state = stockState(item.stock);
      return (
        <span className="inline-flex flex-col items-end gap-1.5">
          <span className="font-display" style={{ color: "var(--admin-ink)" }}>
            {item.stock}
          </span>
          <StatusPill tone={state.tone}>{state.label}</StatusPill>
        </span>
      );
    },
  },
  {
    key: "value",
    header: "Valor",
    align: "right",
    hideBelow: "sm",
    render: (item) => (
      <span className="font-display" style={{ color: "var(--admin-ink)" }}>
        {formatCOP(item.price * item.stock)}
      </span>
    ),
  },
];

export default function InventarioPage() {
  const units = inventory.reduce((sum, item) => sum + item.stock, 0);
  const value = inventory.reduce((sum, item) => sum + item.price * item.stock, 0);
  const healthy = inventory.length - lowStock.length;

  return (
    <>
      <PageHeading
        eyebrow="Catálogo"
        title="Inventario"
        description={`Existencias por referencia. Se marca como bajo todo lo que baje de ${LOW_STOCK} unidades, que es el punto donde conviene volver a pedir.`}
        actions={
          <>
            <button type="button" className="admin-btn">
              <Truck className="size-4" strokeWidth={1.9} />
              Registrar entrada
            </button>
            <button type="button" className="admin-btn admin-btn-primary">
              <PackageCheck className="size-4" strokeWidth={1.9} />
              Ajustar existencias
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Unidades" value={String(units)} icon={Boxes} tone="lavender" hint="en bodega" />
        <StatCard label="Saludables" value={String(healthy)} icon={PackageCheck} tone="mint" hint={`sobre ${LOW_STOCK} uds.`} delay={0.05} />
        <StatCard label="Por reponer" value={String(lowStock.length)} icon={AlertTriangle} tone="gold" hint="bajo el umbral" delay={0.1} />
        <StatCard label="Valor en bodega" value={formatCOP(value)} icon={Boxes} tone="rose" hint="a precio de venta" delay={0.15} />
      </div>

      {/* Alertas */}
      <Panel className="admin-in" padded={false}>
        <div className="p-6">
          <PanelHeader
            title="Necesitan atención"
            description="Ordenados de más urgente a menos"
            action={<StatusPill tone="gold">{lowStock.length} referencias</StatusPill>}
          />
        </div>

        {lowStock.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Nada por reponer"
            description="Todas las referencias están por encima del umbral. Buen momento para planear el próximo lanzamiento."
          />
        ) : (
          <ul className="grid gap-px" style={{ background: "var(--admin-line-soft)" }}>
            {lowStock.map((item) => {
              const state = stockState(item.stock);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                  style={{ background: "var(--admin-surface)" }}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                    <Image src={item.image} alt="" fill loading="lazy" sizes="48px" className="object-cover" />
                  </span>

                  <span className="min-w-0 flex-1 basis-52">
                    <span className="block truncate font-display text-[0.95rem]" style={{ color: "var(--admin-ink)" }}>
                      {item.name}
                    </span>
                    <span className="admin-muted block text-xs">
                      {categoryName(item.category)} · {item.subcategory}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1 basis-40">
                    <Meter value={(item.stock / LOW_STOCK) * 100} tone={state.tone as Tone} />
                    <span className="admin-muted mt-2 block text-xs">
                      {item.stock} de {LOW_STOCK} uds. · {item.reserved} reservadas
                    </span>
                  </span>

                  <StatusPill tone={state.tone}>{state.label}</StatusPill>

                  <button type="button" className="admin-btn px-4 py-2 text-[0.82rem]">
                    Reponer
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel className="admin-in">
        <PanelHeader
          title="Inventario completo"
          description={`${inventory.length} referencias · ${outOfStock.length} agotadas`}
        />

        <div className="mt-5">
          <Toolbar
            placeholder="Buscar por producto o SKU…"
            filters={["Todo", "Crítico", "Bajo", "Agotado"]}
          />
        </div>

        <div className="mt-6">
          <DataTable
            caption="Inventario completo por referencia"
            columns={columns}
            rows={inventory}
            footer={
              <>
                <span>Mostrando {inventory.length} referencias</span>
                <span>Umbral de reposición: {LOW_STOCK} unidades</span>
              </>
            }
          />
        </div>
      </Panel>
    </>
  );
}

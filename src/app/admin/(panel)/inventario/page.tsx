import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle, Boxes, PackageCheck, PackageX, Truck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listProducts, type Product } from "@/services/products";
import { formatCOP } from "@/lib/utils";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
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

// Las existencias cambian desde el propio panel: nada que cachear entre visitas.
export const dynamic = "force-dynamic";

/**
 * Inventario.
 *
 * Todo sale de la tabla `products`: existencias, precios y categorías son las
 * reales del catálogo. Lo único que desapareció respecto a la versión anterior
 * son las unidades "reservadas", que no existían en ningún sitio — se
 * calculaban a partir de la longitud del nombre del producto.
 */

/**
 * Umbral de reposición. Coincide con el índice parcial de `0001_init.sql`
 * (`products_low_stock_idx ... where stock <= 12`).
 */
const LOW_STOCK = 12;

/** Cómo de sano está el stock de una referencia. */
function stockState(stock: number): { label: string; tone: Tone } {
  if (stock === 0) return { label: "Agotado", tone: "neutral" };
  if (stock <= 6) return { label: "Crítico", tone: "rose" };
  if (stock <= LOW_STOCK) return { label: "Bajo", tone: "gold" };
  return { label: "Saludable", tone: "mint" };
}

/** Miniatura del producto, con la inicial cuando todavía no hay foto. */
function Thumb({ product, size }: { product: Product; size: "sm" | "md" }) {
  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-2xl bg-cream-deep ${
        size === "sm" ? "size-11" : "size-12"
      }`}
    >
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          loading="lazy"
          sizes={size === "sm" ? "44px" : "48px"}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="tone-rose grid size-full place-items-center font-display text-sm"
        >
          {product.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

const columns: Column<Product>[] = [
  {
    key: "name",
    header: "Producto",
    render: (item) => (
      <span className="flex items-center gap-3.5">
        <Thumb product={item} size="sm" />
        <span className="min-w-0">
          <span
            className="block truncate font-display text-[0.92rem]"
            style={{ color: "var(--admin-ink)" }}
          >
            {item.name}
          </span>
          <span className="admin-muted block truncate text-xs">
            {item.subcategory ?? "Sin subcategoría"}
          </span>
        </span>
      </span>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    hideBelow: "lg",
    render: (item) => (
      <span className="admin-muted font-mono text-xs">{item.slug}</span>
    ),
  },
  {
    key: "category",
    header: "Categoría",
    hideBelow: "md",
    render: (item) => item.categoryName ?? "Sin categoría",
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

export default async function InventarioPage() {
  const heading = (
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
  );

  if (!isSupabaseConfigured()) {
    return (
      <>
        {heading}
        <SupabaseSetupNotice what="El inventario" />
      </>
    );
  }

  const products = await listProducts();
  const inventory = [...products].sort((a, b) => a.stock - b.stock);

  const lowStock = inventory.filter((item) => item.stock <= LOW_STOCK);
  const outOfStock = inventory.filter((item) => item.stock === 0);
  const units = inventory.reduce((sum, item) => sum + item.stock, 0);
  const value = inventory.reduce((sum, item) => sum + item.price * item.stock, 0);
  const healthy = inventory.length - lowStock.length;

  return (
    <>
      {heading}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Unidades"
          value={String(units)}
          icon={Boxes}
          tone="lavender"
          hint="en bodega"
        />
        <StatCard
          label="Saludables"
          value={String(healthy)}
          icon={PackageCheck}
          tone="mint"
          hint={`sobre ${LOW_STOCK} uds.`}
          delay={0.05}
        />
        <StatCard
          label="Por reponer"
          value={String(lowStock.length)}
          icon={AlertTriangle}
          tone="gold"
          hint="bajo el umbral"
          delay={0.1}
        />
        <StatCard
          label="Valor en bodega"
          value={formatCOP(value)}
          icon={Boxes}
          tone="rose"
          hint="a precio de venta"
          delay={0.15}
        />
      </div>

      {/* Alertas */}
      <Panel className="admin-in" padded={false}>
        <div className="p-6">
          <PanelHeader
            title="Necesitan atención"
            description="Ordenados de más urgente a menos"
            action={
              <StatusPill tone={lowStock.length ? "gold" : "mint"}>
                {lowStock.length} {lowStock.length === 1 ? "referencia" : "referencias"}
              </StatusPill>
            }
          />
        </div>

        {lowStock.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title={inventory.length ? "Nada por reponer" : "Sin referencias todavía"}
            description={
              inventory.length
                ? "Todas las referencias están por encima del umbral. Buen momento para planear el próximo lanzamiento."
                : "Cuando cargues productos con sus existencias, aquí verás los que estén por agotarse."
            }
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
                  <Thumb product={item} size="md" />

                  <span className="min-w-0 flex-1 basis-52">
                    <span
                      className="block truncate font-display text-[0.95rem]"
                      style={{ color: "var(--admin-ink)" }}
                    >
                      {item.name}
                    </span>
                    <span className="admin-muted block truncate text-xs">
                      {item.categoryName ?? "Sin categoría"}
                      {item.subcategory && ` · ${item.subcategory}`}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1 basis-40">
                    <Meter value={(item.stock / LOW_STOCK) * 100} tone={state.tone} />
                    <span className="admin-muted mt-2 block text-xs">
                      {item.stock} de {LOW_STOCK} uds.
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
          description={`${inventory.length} ${inventory.length === 1 ? "referencia" : "referencias"} · ${outOfStock.length} ${outOfStock.length === 1 ? "agotada" : "agotadas"}`}
        />

        {inventory.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="El catálogo está vacío"
            description="Crea productos desde el módulo de Productos y sus existencias aparecerán aquí."
          />
        ) : (
          <>
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
                    <span>
                      Mostrando {inventory.length}{" "}
                      {inventory.length === 1 ? "referencia" : "referencias"}
                    </span>
                    <span>Umbral de reposición: {LOW_STOCK} unidades</span>
                  </>
                }
              />
            </div>
          </>
        )}
      </Panel>
    </>
  );
}

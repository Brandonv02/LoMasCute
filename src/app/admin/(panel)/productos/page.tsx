import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Package, PackageX, Plus, Sparkles, Tag } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ProductStatus } from "@/lib/supabase/types";
import { listCategoryOptions } from "@/services/categories";
import { getProductStats, listProducts, type Product } from "@/services/products";
import { discountPercent, formatCOP } from "@/lib/utils";
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
  RowActions,
  StatusSelect,
  StockStepper,
} from "@/app/admin/(panel)/productos/row-controls";

export const metadata: Metadata = { title: "Productos" };

// El catálogo cambia desde el propio panel: nada que cachear entre visitas.
export const dynamic = "force-dynamic";

const columns: Column<Product>[] = [
  {
    key: "name",
    header: "Producto",
    render: (product) => (
      <span className="flex items-center gap-3.5">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            // Producto todavía sin fotos: la inicial evita un hueco vacío.
            <span
              aria-hidden
              className="tone-rose grid size-full place-items-center font-display text-sm"
            >
              {product.name.charAt(0)}
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span
            className="block truncate font-display text-[0.92rem]"
            style={{ color: "var(--admin-ink)" }}
          >
            {product.name}
          </span>
          <span className="admin-muted block truncate font-mono text-xs">
            {product.slug}
            {product.imageCount === 0 && " · sin fotos"}
          </span>
        </span>
      </span>
    ),
  },
  {
    key: "category",
    header: "Categoría",
    hideBelow: "lg",
    render: (product) =>
      product.categoryName ?? <span className="admin-muted">Sin categoría</span>,
  },
  {
    key: "price",
    header: "Precio",
    align: "right",
    render: (product) => {
      const discount = discountPercent(product.price, product.compareAtPrice ?? undefined);
      return (
        <span className="flex flex-col items-end gap-1">
          <span className="font-display" style={{ color: "var(--admin-ink)" }}>
            {formatCOP(product.price)}
          </span>
          {discount > 0 && (
            <span className="admin-muted text-xs line-through">
              {formatCOP(product.compareAtPrice!)}
            </span>
          )}
        </span>
      );
    },
  },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    hideBelow: "sm",
    render: (product) => <StockStepper id={product.id} stock={product.stock} />,
  },
  {
    key: "status",
    header: "Estado",
    render: (product) => <StatusSelect id={product.id} status={product.status} />,
  },
  {
    key: "featured",
    header: "Destacado",
    align: "right",
    hideBelow: "lg",
    render: (product) =>
      product.isFeatured ? (
        <StatusPill tone="gold" plain>
          Destacado
        </StatusPill>
      ) : (
        <span className="admin-muted text-xs">—</span>
      ),
  },
  {
    key: "actions",
    header: "Acciones",
    align: "right",
    render: (product) => <RowActions id={product.id} name={product.name} />,
  },
];

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    estado?: string;
    categoria?: string;
    creado?: string;
    actualizado?: string;
  }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading
          eyebrow="Catálogo"
          title="Productos"
          description="Todo lo que hoy está publicado en la tienda."
        />
        <SupabaseSetupNotice what="El catálogo de productos" />
      </>
    );
  }

  const params = await searchParams;
  const status = (params.estado ?? "all") as ProductStatus | "all";

  // La categoría llega por slug (así el enlace es legible); la resolvemos a id.
  const categories = await listCategoryOptions();
  const category = params.categoria
    ? categories.find((option) => option.slug === params.categoria)
    : undefined;

  const [products, stats] = await Promise.all([
    listProducts({ search: params.q, status, categoryId: category?.id }),
    getProductStats(),
  ]);

  const filtered = Boolean(params.q) || status !== "all" || Boolean(category);

  /** Cambia un filtro conservando los demás */
  const hrefWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: params.q, estado: params.estado, categoria: params.categoria, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all") next.set(key, value);
    }
    const query = next.toString();
    return query ? `/admin/productos?${query}` : "/admin/productos";
  };

  return (
    <>
      <PageHeading
        eyebrow="Catálogo"
        title="Productos"
        description="Todo lo que hoy está publicado en la tienda. Desde aquí se controlan precios, existencias y estado."
        actions={
          <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
            <Plus className="size-4" strokeWidth={2} />
            Nuevo producto
          </Link>
        }
      />

      {(params.creado || params.actualizado) && (
        <div
          role="status"
          className="tone-mint admin-in flex items-center gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <CircleCheck className="size-4 shrink-0" strokeWidth={2} />
          {params.creado
            ? `Producto "${params.creado}" creado.`
            : "Cambios guardados."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Productos" value={String(stats.total)} icon={Package} tone="rose" hint={`${stats.drafts} en borrador`} />
        <StatCard label="Publicados" value={String(stats.published)} icon={Sparkles} tone="mint" hint="visibles en la tienda" delay={0.05} />
        <StatCard label="En promoción" value={String(stats.discounted)} icon={Tag} tone="lavender" hint="con precio anterior" delay={0.1} />
        <StatCard
          label="Valor del catálogo"
          value={formatCOP(stats.catalogValue)}
          icon={Package}
          tone="gold"
          hint="precio × existencias"
          delay={0.15}
        />
      </div>

      <Panel className="admin-in">
        <PanelHeader
          title="Todos los productos"
          description={`${products.length} ${products.length === 1 ? "referencia" : "referencias"} en ${categories.length} categorías`}
          action={
            <Link href="/admin/categorias" className="admin-btn px-4 py-2 text-[0.82rem]">
              Ver categorías
            </Link>
          }
        />

        {/* Los filtros viven en la URL, no en estado de cliente: así se pueden
            compartir, volver atrás y recargar sin perder el contexto. */}
        <form className="mt-5" method="get">
          <Toolbar
            placeholder="Buscar por nombre, tono o descripción…"
            name="q"
            defaultValue={params.q}
          >
            {status !== "all" && <input type="hidden" name="estado" value={status} />}
            {params.categoria && (
              <input type="hidden" name="categoria" value={params.categoria} />
            )}
          </Toolbar>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Todos"],
              ["published", "Publicados"],
              ["draft", "Borradores"],
              ["archived", "Archivados"],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              href={hrefWith({ estado: value })}
              className={`admin-btn px-4 py-2 text-[0.82rem] ${status === value ? "admin-btn-primary" : ""}`}
            >
              {label}
            </Link>
          ))}

          {category && (
            <Link href={hrefWith({ categoria: undefined })} className="admin-btn px-4 py-2 text-[0.82rem]">
              Categoría: {category.name} ✕
            </Link>
          )}
        </div>

        <div className="mt-6">
          {products.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title={filtered ? "Nada con ese filtro" : "Todavía no hay productos"}
              description={
                filtered
                  ? "Prueba con otra búsqueda o quita los filtros."
                  : "Crea el primer producto o ejecuta supabase/seed.sql para cargar el catálogo actual."
              }
              action={
                filtered ? (
                  <Link href="/admin/productos" className="admin-btn">
                    Quitar filtros
                  </Link>
                ) : (
                  <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
                    <Plus className="size-4" strokeWidth={2} />
                    Nuevo producto
                  </Link>
                )
              }
            />
          ) : (
            <DataTable
              caption="Listado completo de productos"
              columns={columns}
              rows={products}
              minWidth="52rem"
              footer={
                <>
                  <span>
                    Mostrando {products.length} de {stats.total} productos
                  </span>
                  <span>{stats.outOfStock} agotados</span>
                </>
              }
            />
          )}
        </div>
      </Panel>
    </>
  );
}

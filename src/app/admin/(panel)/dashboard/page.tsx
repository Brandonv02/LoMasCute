import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Eye,
  ListChecks,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getProductStats, listProducts, type Product } from "@/services/products";
import { formatCOP } from "@/lib/utils";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import {
  EmptyState,
  Meter,
  PageHeading,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

// Todo lo que se pinta aquí sale de la base y de la hora actual: nada que
// cachear entre visitas.
export const dynamic = "force-dynamic";

/**
 * Dashboard.
 *
 * Regla de la pantalla: **solo se muestra lo que existe de verdad.** Hoy la
 * base tiene catálogo (`products`), así que el inventario y el valor del
 * catálogo son cifras reales. No hay tablas de pedidos, clientas ni analítica,
 * y por eso esos bloques no enseñan un número inventado: enseñan su estado
 * vacío y explican qué falta para que se llenen.
 */

/**
 * Umbral de reposición. Coincide con el índice parcial de
 * `0001_init.sql` (`products_low_stock_idx ... where stock <= 12`).
 */
const LOW_STOCK = 12;

/** Saludo por la hora de Colombia, sin nombre propio. */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function today(): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

/** Miniatura del producto, con la inicial cuando todavía no hay foto. */
function Thumb({ product }: { product: Product }) {
  return (
    <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt=""
          fill
          loading="lazy"
          sizes="44px"
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

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading
          eyebrow={`Hoy, ${today()}`}
          title={`${greeting()} ✿`}
          description="El resumen de la tienda se arma con los datos de la base."
        />
        <SupabaseSetupNotice what="El dashboard" />
      </>
    );
  }

  const [stats, products] = await Promise.all([getProductStats(), listProducts()]);

  const lowStock = products
    .filter((product) => product.stock <= LOW_STOCK)
    .sort((a, b) => a.stock - b.stock);

  // El saludo describe lo que sí sabemos: el estado del catálogo.
  const summary = stats.total
    ? [
        `${stats.published} ${stats.published === 1 ? "producto publicado" : "productos publicados"}`,
        stats.drafts > 0 &&
          `${stats.drafts} en ${stats.drafts === 1 ? "borrador" : "borradores"}`,
        lowStock.length > 0 &&
          `${lowStock.length} por reponer`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Todavía no hay productos en el catálogo. Empieza por crear el primero.";

  return (
    <>
      <PageHeading
        eyebrow={`Hoy, ${today()}`}
        // Cuando exista autenticación, aquí va el nombre de quien entra.
        title={`${greeting()} ✿`}
        description={summary}
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

      {/* Indicadores. Los tres primeros esperan a que existan pedidos y
          analítica; el cuarto ya sale del catálogo real. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas del día"
          value="—"
          icon={CircleDollarSign}
          tone="rose"
          hint="Sin pedidos registrados"
          delay={0}
        />
        <StatCard
          label="Pedidos"
          value="—"
          icon={ShoppingBag}
          tone="lavender"
          hint="Sin pedidos registrados"
          delay={0.05}
        />
        <StatCard
          label="Visitas a la tienda"
          value="—"
          icon={Eye}
          tone="mint"
          hint="Sin analítica conectada"
          delay={0.1}
        />
        <StatCard
          label="Valor del catálogo"
          value={formatCOP(stats.catalogValue)}
          icon={Wallet}
          tone="gold"
          hint="precio × existencias"
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
          <EmptyState
            icon={ShoppingBag}
            title="Todavía no hay pedidos"
            description="Cuando el checkout empiece a registrar pedidos, los últimos aparecerán aquí con su clienta, su estado y su total."
          />
        </Panel>

        {/* Actividad */}
        <Panel className="admin-in">
          <PanelHeader title="Actividad" description="Lo que ha pasado hoy" />
          <EmptyState
            icon={Sparkles}
            title="Sin actividad todavía"
            description="Aquí se irán anotando los pedidos, los pagos y los cambios de stock a medida que ocurran."
          />
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
          <EmptyState
            icon={Package}
            title="Aún no hay ventas"
            description="Este ranking se calcula con los pedidos entregados. En cuanto haya ventas, los productos se ordenarán solos."
          />
        </Panel>

        {/* Stock bajo: dato real del catálogo */}
        <Panel className="admin-in">
          <PanelHeader
            title="Por reponer"
            description={
              lowStock.length
                ? `${lowStock.length} ${lowStock.length === 1 ? "producto bajo" : "productos bajo"} el umbral de ${LOW_STOCK}`
                : `Umbral de reposición: ${LOW_STOCK} unidades`
            }
            action={
              <Link href="/admin/inventario" className="admin-btn px-4 py-2 text-[0.82rem]">
                Inventario
              </Link>
            }
          />

          {lowStock.length ? (
            <ul className="mt-5 flex flex-col gap-3.5">
              {lowStock.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center gap-3.5">
                  <Thumb product={item} />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[0.9rem]"
                      style={{ color: "var(--admin-ink)" }}
                    >
                      {item.name}
                    </span>
                    <span className="admin-muted block truncate text-xs">
                      {item.subcategory ?? item.categoryName ?? "Sin categoría"}
                    </span>
                  </span>
                  <StatusPill
                    tone={item.stock === 0 ? "neutral" : item.stock <= 6 ? "rose" : "gold"}
                  >
                    {item.stock === 0 ? "Agotado" : `${item.stock} uds.`}
                  </StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={PackageCheck}
              title={stats.total ? "Nada por reponer" : "Sin productos todavía"}
              description={
                stats.total
                  ? "Ningún producto está por debajo del umbral. El inventario va sobre ruedas."
                  : "Cuando cargues productos con sus existencias, aquí verás los que estén por agotarse."
              }
            />
          )}
        </Panel>

        {/* Tu día */}
        <Panel className="admin-in">
          <PanelHeader
            title="Tu día"
            description={
              stats.total
                ? `${stats.published} de ${stats.total} en la tienda`
                : "Sin catálogo todavía"
            }
          />

          <Meter
            value={stats.total ? (stats.published / stats.total) * 100 : 0}
            tone="mint"
            className="mt-5"
          />

          <div className="mt-5">
            <EmptyState
              icon={ListChecks}
              title="Sin tareas pendientes"
              description="Las tareas del día aparecerán aquí cuando existan pedidos que confirmar o reposiciones que hacer."
            />
          </div>

          <div className="admin-rule my-6" />

          <dl className="grid grid-cols-2 gap-4 text-center">
            <div>
              <dt className="admin-eyebrow">Productos</dt>
              <dd className="admin-title mt-1.5 text-xl">{stats.total}</dd>
            </div>
            <div>
              <dt className="admin-eyebrow">Publicados</dt>
              <dd className="admin-title mt-1.5 text-xl">{stats.published}</dd>
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

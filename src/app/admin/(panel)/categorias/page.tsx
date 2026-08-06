import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Shapes, Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listCategoriesWithCounts } from "@/services/categories";
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

export const metadata: Metadata = { title: "Categorías" };
export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading
          eyebrow="Catálogo"
          title="Categorías"
          description="La estructura con la que la clienta recorre la tienda."
        />
        <SupabaseSetupNotice what="Las categorías" />
      </>
    );
  }

  const categories = await listCategoriesWithCounts();
  const live = categories.filter((category) => !category.comingSoon);
  const total = categories.reduce((sum, category) => sum + category.totalCount, 0);

  return (
    <>
      <PageHeading
        eyebrow="Catálogo"
        title="Categorías"
        description="La estructura con la que la clienta recorre la tienda. Los contadores salen de la base de datos, no de una estimación."
        actions={
          <Link href="/admin/productos" className="admin-btn">
            <Shapes className="size-4" strokeWidth={1.9} />
            Ver productos
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Categorías"
          value={String(categories.length)}
          icon={Shapes}
          tone="lavender"
          hint="en el sistema"
        />
        <StatCard
          label="Con producto"
          value={String(categories.filter((c) => c.totalCount > 0).length)}
          icon={Sparkles}
          tone="mint"
          hint="ya surtidas"
          delay={0.05}
        />
        <StatCard
          label="Muy pronto"
          value={String(categories.length - live.length)}
          icon={Clock}
          tone="gold"
          hint="anunciadas"
          delay={0.1}
        />
      </div>

      {categories.length === 0 ? (
        <Panel className="admin-in">
          <EmptyState
            icon={Shapes}
            title="Todavía no hay categorías"
            description="Crea la primera categoría desde la base para empezar a ordenar el catálogo."
          />
        </Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, i) => {
            const share = total ? (category.totalCount / total) * 100 : 0;

            return (
              <article
                key={category.id}
                className="admin-panel admin-in overflow-hidden"
                style={{ "--admin-delay": `${i * 0.04}s` } as React.CSSProperties}
              >
                <div className="relative aspect-[16/7] overflow-hidden bg-cream-deep">
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute left-4 top-4">
                    <StatusPill tone={category.tone} plain>
                      {category.slug}
                    </StatusPill>
                  </span>
                  {category.comingSoon && (
                    <span className="absolute right-4 top-4">
                      <StatusPill tone="neutral">Muy pronto</StatusPill>
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="admin-title text-lg">{category.name}</h2>
                  {category.claim && (
                    <p className="admin-muted mt-1 text-sm">{category.claim}</p>
                  )}

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <span>
                      <span className="admin-eyebrow block">Productos</span>
                      <span className="admin-title mt-1 block text-xl">
                        {category.totalCount}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="admin-eyebrow block">Valor</span>
                      <span className="admin-title mt-1 block text-sm">
                        {formatCOP(category.stockValue)}
                      </span>
                    </span>
                  </div>

                  <Meter value={share} tone={category.tone} className="mt-4" />
                  <p className="admin-muted mt-2 text-xs">
                    {share.toFixed(0)}% del catálogo · {category.productCount} publicados
                  </p>

                  <Link
                    href={`/admin/productos?categoria=${category.slug}`}
                    className="admin-btn mt-5 w-full px-4 py-2 text-[0.82rem]"
                  >
                    Ver sus productos
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Panel className="admin-in">
        <PanelHeader
          title="Editar categorías"
          description="Esta fase conecta la lectura. La edición de categorías llega junto con la subida de imágenes."
        />
      </Panel>
    </>
  );
}

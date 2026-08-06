import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Layers, Shapes, Sparkles } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listCategoriesWithCounts } from "@/services/categories";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import { CategoriesManager } from "@/app/admin/(panel)/categorias/categories-manager";
import { EmptyState, PageHeading, Panel, StatCard } from "@/components/admin/ui";

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
  const subcategorias = categories.reduce(
    (sum, category) => sum + category.subcategories.length,
    0,
  );

  return (
    <>
      <PageHeading
        eyebrow="Catálogo"
        title="Categorías"
        description="La estructura con la que la clienta recorre la tienda: se crea, se ordena y se activa desde aquí, sin tocar código."
        actions={
          <Link href="/admin/productos" className="admin-btn">
            <Shapes className="size-4" strokeWidth={1.9} />
            Ver productos
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Categorías"
          value={String(categories.length)}
          icon={Shapes}
          tone="lavender"
          hint="en el sistema"
        />
        <StatCard
          label="Subcategorías"
          value={String(subcategorias)}
          icon={Layers}
          tone="peach"
          hint="segundo nivel"
          delay={0.05}
        />
        <StatCard
          label="Con producto"
          value={String(categories.filter((c) => c.totalCount > 0).length)}
          icon={Sparkles}
          tone="mint"
          hint="ya surtidas"
          delay={0.1}
        />
        <StatCard
          label="Muy pronto"
          value={String(categories.length - live.length)}
          icon={Clock}
          tone="gold"
          hint="anunciadas"
          delay={0.15}
        />
      </div>

      <CategoriesManager categories={categories} />

      {categories.length === 0 && (
        <Panel className="admin-in">
          <EmptyState
            icon={Shapes}
            title="Todavía no hay categorías"
            description="Crea la primera con el botón de arriba: nombre, color y orden. La tienda la mostrará en cuanto tenga un producto publicado."
          />
        </Panel>
      )}
    </>
  );
}

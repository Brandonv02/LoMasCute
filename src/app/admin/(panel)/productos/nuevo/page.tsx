import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listCategoryOptions } from "@/services/categories";
import { PageHeading } from "@/components/admin/ui";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import { ProductForm } from "@/app/admin/(panel)/productos/product-form";

export const metadata: Metadata = { title: "Nuevo producto" };
export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading eyebrow="Catálogo · Productos" title="Nuevo producto" />
        <SupabaseSetupNotice what="Crear productos" />
      </>
    );
  }

  const categories = await listCategoryOptions();

  return (
    <>
      <PageHeading
        eyebrow="Catálogo · Productos"
        title="Nuevo producto"
        description="Nace como borrador salvo que elijas publicarlo. Las imágenes se añaden en una fase posterior."
      />
      <ProductForm categories={categories} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { listCategoryOptions } from "@/services/categories";
import { getProduct } from "@/services/products";
import { listProductImages } from "@/services/product-images";
import { formatCOP } from "@/lib/utils";
import { PageHeading, StatusPill } from "@/components/admin/ui";
import { SupabaseSetupNotice } from "@/components/admin/setup-notice";
import { ProductForm } from "@/app/admin/(panel)/productos/product-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Editar producto" };
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product ? `Editar · ${product.name}` : "Editar producto" };
}

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeading eyebrow="Catálogo · Productos" title="Editar producto" />
        <SupabaseSetupNotice what="Editar productos" />
      </>
    );
  }

  const { id } = await params;
  const [product, categories, images] = await Promise.all([
    getProduct(id),
    listCategoryOptions(),
    listProductImages(id),
  ]);

  if (!product) notFound();

  const updated = new Date(product.updatedAt).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <>
      <PageHeading
        eyebrow="Catálogo · Productos"
        title={product.name}
        description={`${formatCOP(product.price)} · ${product.stock} en existencia · última edición el ${updated}`}
        actions={
          <StatusPill
            tone={
              product.status === "published"
                ? "mint"
                : product.status === "draft"
                  ? "gold"
                  : "neutral"
            }
          >
            {product.status === "published"
              ? "Publicado"
              : product.status === "draft"
                ? "Borrador"
                : "Archivado"}
          </StatusPill>
        }
      />
      <ProductForm categories={categories} product={product} images={images} />
    </>
  );
}

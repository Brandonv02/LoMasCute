import "server-only";

import { adminClient } from "@/lib/supabase/client";
import type { BrandTone, CategoryRow } from "@/lib/supabase/types";
import { toServiceError } from "@/services/errors";

/**
 * Servicio de categorías.
 *
 * Ningún componente habla con Supabase: piden aquí y reciben tipos del
 * dominio. Cuando cambie el esquema, este archivo absorbe el cambio.
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  imageUrl: string | null;
  tone: BrandTone;
  position: number;
  isActive: boolean;
  comingSoon: boolean;
};

export type CategoryWithCounts = Category & {
  /** Productos publicados */
  productCount: number;
  /** Todos, incluidos borradores y archivados */
  totalCount: number;
  /** Valor a precio de venta de las existencias */
  stockValue: number;
};

/** Opción mínima para los <select> del formulario */
export type CategoryOption = Pick<Category, "id" | "name" | "slug">;

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    claim: row.claim,
    description: row.description,
    imageUrl: row.image_url,
    tone: row.tone,
    position: row.position,
    isActive: row.is_active,
    comingSoon: row.coming_soon,
  };
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await adminClient()
    .from("categories")
    .select("*")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw toServiceError(error);
  return (data ?? []).map(toCategory);
}

export async function listCategoryOptions(): Promise<CategoryOption[]> {
  const { data, error } = await adminClient()
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) throw toServiceError(error);
  return data ?? [];
}

/**
 * Categorías con sus contadores.
 *
 * Se resuelve con dos consultas y un agrupado en memoria en lugar de una por
 * categoría: con seis categorías da igual, con sesenta no. Cuando el catálogo
 * crezca, esto se convierte en una vista materializada sin tocar quien lo usa.
 */
export async function listCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  const client = adminClient();

  const [categories, products] = await Promise.all([
    listCategories(),
    client.from("products").select("category_id, status, price, stock"),
  ]);

  if (products.error) throw toServiceError(products.error);

  const stats = new Map<string, { published: number; total: number; value: number }>();

  for (const product of products.data ?? []) {
    if (!product.category_id) continue;
    const entry = stats.get(product.category_id) ?? { published: 0, total: 0, value: 0 };
    entry.total += 1;
    if (product.status === "published") entry.published += 1;
    entry.value += product.price * product.stock;
    stats.set(product.category_id, entry);
  }

  return categories.map((category) => {
    const entry = stats.get(category.id);
    return {
      ...category,
      productCount: entry?.published ?? 0,
      totalCount: entry?.total ?? 0,
      stockValue: entry?.value ?? 0,
    };
  });
}

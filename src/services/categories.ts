import "server-only";

import { adminClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import type {
  BrandTone,
  CategoryRow,
  SubcategoryRow,
} from "@/lib/supabase/types";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Servicio de categorías y subcategorías.
 *
 * Es la única puerta al esquema del catálogo: el panel pide aquí y recibe tipos
 * del dominio. Toda la estructura de la tienda —qué categorías existen, en qué
 * orden, con qué subcategorías— vive en la base, así que crear una categoría
 * nueva no toca código ni exige desplegar.
 */

export type Subcategory = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  position: number;
  isActive: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  imageUrl: string | null;
  tone: BrandTone;
  icon: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
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
  subcategories: (Subcategory & { productCount: number })[];
};

/** Opción mínima para los <select> del formulario de producto */
export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
};

/** Lo que el panel envía al crear o editar una categoría. */
export type CategoryInput = {
  name: string;
  slug: string;
  claim: string;
  description: string;
  imageUrl: string;
  tone: BrandTone;
  icon: string;
  seoTitle: string;
  seoDescription: string;
  isActive: boolean;
  comingSoon: boolean;
};

export type SubcategoryInput = {
  name: string;
  slug: string;
  isActive: boolean;
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    claim: row.claim,
    description: row.description,
    imageUrl: row.image_url,
    tone: row.tone,
    icon: row.icon,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    position: row.position,
    isActive: row.is_active,
    comingSoon: row.coming_soon,
  };
}

function toSubcategory(row: SubcategoryRow): Subcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    name: row.name,
    position: row.position,
    isActive: row.is_active,
  };
}

/* -------------------------------------------------------------------- lectura */

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await adminClient()
    .from("categories")
    .select("*")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw toServiceError(error);
  return (data ?? []).map(toCategory);
}

/** Categorías activas con sus subcategorías activas, para el alta de productos. */
export async function listCategoryOptions(): Promise<CategoryOption[]> {
  const client = adminClient();

  const [categories, subcategories] = await Promise.all([
    client
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("position", { ascending: true }),
    client
      .from("subcategories")
      .select("id, category_id, name, slug")
      .eq("is_active", true)
      .order("position", { ascending: true }),
  ]);

  if (categories.error) throw toServiceError(categories.error);
  if (subcategories.error) throw toServiceError(subcategories.error);

  const porCategoria = new Map<string, CategoryOption["subcategories"]>();
  for (const sub of subcategories.data ?? []) {
    const lista = porCategoria.get(sub.category_id) ?? [];
    lista.push({ id: sub.id, name: sub.name, slug: sub.slug });
    porCategoria.set(sub.category_id, lista);
  }

  return (categories.data ?? []).map((category) => ({
    ...category,
    subcategories: porCategoria.get(category.id) ?? [],
  }));
}

/**
 * Categorías con sus contadores y su segundo nivel.
 *
 * Tres consultas y un agrupado en memoria en lugar de una por categoría: con
 * seis da igual, con sesenta no. Cuando el catálogo crezca, esto se convierte en
 * una vista materializada sin tocar a quien lo usa.
 */
export async function listCategoriesWithCounts(): Promise<CategoryWithCounts[]> {
  const client = adminClient();

  const [categories, subcategories, products] = await Promise.all([
    listCategories(),
    client
      .from("subcategories")
      .select("*")
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
    client.from("products").select("category_id, subcategory_id, status, price, stock"),
  ]);

  if (subcategories.error) throw toServiceError(subcategories.error);
  if (products.error) throw toServiceError(products.error);

  const porCategoria = new Map<
    string,
    { published: number; total: number; value: number }
  >();
  const porSubcategoria = new Map<string, number>();

  for (const product of products.data ?? []) {
    if (product.subcategory_id) {
      porSubcategoria.set(
        product.subcategory_id,
        (porSubcategoria.get(product.subcategory_id) ?? 0) + 1,
      );
    }
    if (!product.category_id) continue;
    const entry =
      porCategoria.get(product.category_id) ?? { published: 0, total: 0, value: 0 };
    entry.total += 1;
    if (product.status === "published") entry.published += 1;
    entry.value += product.price * product.stock;
    porCategoria.set(product.category_id, entry);
  }

  const subsPorCategoria = new Map<string, CategoryWithCounts["subcategories"]>();
  for (const row of subcategories.data ?? []) {
    const sub = toSubcategory(row);
    const lista = subsPorCategoria.get(sub.categoryId) ?? [];
    lista.push({ ...sub, productCount: porSubcategoria.get(sub.id) ?? 0 });
    subsPorCategoria.set(sub.categoryId, lista);
  }

  return categories.map((category) => {
    const entry = porCategoria.get(category.id);
    return {
      ...category,
      productCount: entry?.published ?? 0,
      totalCount: entry?.total ?? 0,
      stockValue: entry?.value ?? 0,
      subcategories: subsPorCategoria.get(category.id) ?? [],
    };
  });
}

/* ------------------------------------------------------- escritura: categorías */

/** Siguiente hueco de orden, dejando 10 entre valores para poder intercalar. */
async function nextCategoryPosition() {
  const { data, error } = await adminClient()
    .from("categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (error) throw toServiceError(error);
  return (data?.[0]?.position ?? 0) + 10;
}

async function nextSubcategoryPosition(categoryId: string) {
  const { data, error } = await adminClient()
    .from("subcategories")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1);

  if (error) throw toServiceError(error);
  return (data?.[0]?.position ?? 0) + 10;
}

function limpiar(input: CategoryInput) {
  const name = input.name.trim();
  if (!name) throw new ServiceError("La categoría necesita un nombre.");

  const slug = slugify(input.slug || name);
  if (!slug) throw new ServiceError("Ese nombre no da un slug válido.");

  return {
    name,
    slug,
    claim: input.claim.trim() || null,
    description: input.description.trim() || null,
    image_url: input.imageUrl.trim() || null,
    tone: input.tone,
    icon: input.icon.trim() || null,
    seo_title: input.seoTitle.trim() || null,
    seo_description: input.seoDescription.trim() || null,
    is_active: input.isActive,
    coming_soon: input.comingSoon,
  };
}

export async function createCategory(input: CategoryInput): Promise<void> {
  const fila = limpiar(input);
  const position = await nextCategoryPosition();

  const { error } = await adminClient()
    .from("categories")
    .insert({ ...fila, position });

  if (error) throw toServiceError(error);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const { error } = await adminClient()
    .from("categories")
    .update(limpiar(input))
    .eq("id", id);

  if (error) throw toServiceError(error);
}

/**
 * Borrar una categoría con productos dejaría esos productos huérfanos —la clave
 * ajena los pondría en `null`— así que se avisa en vez de hacerlo a medias.
 */
export async function deleteCategory(id: string): Promise<void> {
  const client = adminClient();

  const { count, error: countError } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) throw toServiceError(countError);
  if ((count ?? 0) > 0) {
    throw new ServiceError(
      `No se puede eliminar: tiene ${count} producto${count === 1 ? "" : "s"}. Muévelos a otra categoría primero o desactívala.`,
    );
  }

  const { error } = await client.from("categories").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await adminClient()
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

/**
 * Reordena intercambiando la posición con la vecina.
 *
 * Se intercambian los dos valores en vez de renumerar la tabla: dos escrituras
 * en lugar de N, y el orden de las demás no se toca.
 */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<void> {
  const categories = await listCategories();
  const index = categories.findIndex((category) => category.id === id);
  if (index < 0) throw new ServiceError("Esa categoría ya no existe.");

  const vecina = categories[direction === "up" ? index - 1 : index + 1];
  if (!vecina) return;

  const actual = categories[index];
  const client = adminClient();

  const [a, b] = await Promise.all([
    client.from("categories").update({ position: vecina.position }).eq("id", actual.id),
    client.from("categories").update({ position: actual.position }).eq("id", vecina.id),
  ]);

  if (a.error) throw toServiceError(a.error);
  if (b.error) throw toServiceError(b.error);

  // Si dos categorías compartían posición, el intercambio no cambia nada:
  // se separan asignando huecos nuevos según el orden deseado.
  if (actual.position === vecina.position) {
    const orden = [...categories];
    orden.splice(index, 1);
    orden.splice(direction === "up" ? index - 1 : index + 1, 0, actual);
    await Promise.all(
      orden.map((category, i) =>
        client
          .from("categories")
          .update({ position: (i + 1) * 10 })
          .eq("id", category.id),
      ),
    );
  }
}

/* ---------------------------------------------------- escritura: subcategorías */

export async function createSubcategory(
  categoryId: string,
  input: SubcategoryInput,
): Promise<void> {
  const name = input.name.trim();
  if (!name) throw new ServiceError("La subcategoría necesita un nombre.");

  const slug = slugify(input.slug || name);
  if (!slug) throw new ServiceError("Ese nombre no da un slug válido.");

  const position = await nextSubcategoryPosition(categoryId);

  const { error } = await adminClient().from("subcategories").insert({
    category_id: categoryId,
    name,
    slug,
    position,
    is_active: input.isActive,
  });

  if (error) throw toServiceError(error);
}

export async function updateSubcategory(
  id: string,
  input: SubcategoryInput,
): Promise<void> {
  const name = input.name.trim();
  if (!name) throw new ServiceError("La subcategoría necesita un nombre.");

  const slug = slugify(input.slug || name);
  if (!slug) throw new ServiceError("Ese nombre no da un slug válido.");

  const { error } = await adminClient()
    .from("subcategories")
    .update({ name, slug, is_active: input.isActive })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

/**
 * Al borrar una subcategoría sus productos quedan solo en su categoría: la
 * clave ajena está declarada `on delete set null` y el disparador limpia el
 * nombre denormalizado. No hace falta bloquear el borrado.
 */
export async function deleteSubcategory(id: string): Promise<void> {
  const { error } = await adminClient().from("subcategories").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

export async function setSubcategoryActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await adminClient()
    .from("subcategories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

export async function moveSubcategory(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const client = adminClient();

  const { data: actual, error: readError } = await client
    .from("subcategories")
    .select("*")
    .eq("id", id)
    .single();

  if (readError) throw toServiceError(readError);

  const { data: hermanas, error: listError } = await client
    .from("subcategories")
    .select("*")
    .eq("category_id", actual.category_id)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (listError) throw toServiceError(listError);

  const lista = hermanas ?? [];
  const index = lista.findIndex((sub) => sub.id === id);
  const vecina = lista[direction === "up" ? index - 1 : index + 1];
  if (!vecina) return;

  // Se renumera la lista entera con huecos de 10: son pocas por categoría y así
  // el orden queda limpio aunque hubiera empates.
  const orden = [...lista];
  orden.splice(index, 1);
  orden.splice(direction === "up" ? index - 1 : index + 1, 0, actual);

  const updates = await Promise.all(
    orden.map((sub, i) =>
      client
        .from("subcategories")
        .update({ position: (i + 1) * 10 })
        .eq("id", sub.id),
    ),
  );

  const fallo = updates.find((result) => result.error);
  if (fallo?.error) throw toServiceError(fallo.error);
}

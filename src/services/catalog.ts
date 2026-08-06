import "server-only";

import { cache } from "react";
import { publicClient, PRODUCTS_BUCKET, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Category, CategorySlug, Product, Shade } from "@/lib/types";

/**
 * Catálogo para la tienda pública.
 *
 * Única fuente del catálogo: productos y categorías salen de la base, con los
 * tipos `Product` y `Category` que consumen las vistas. En el proyecto no queda
 * ningún catálogo escrito a mano.
 *
 * Usa el cliente anónimo a propósito, no el de servicio. Así RLS es de verdad
 * la frontera: la tienda solo puede ver lo publicado, y si mañana alguien
 * escribe una consulta descuidada aquí, la base la sigue limitando.
 *
 * `cache()` deduplica dentro de una misma petición: la portada pide el
 * catálogo tres veces (destacados, nuevos, favoritos) y viaja una sola vez.
 */

/** Fila con las relaciones embebidas. `select *` para tolerar columnas nuevas. */
type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  subcategory: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  rating: number | string;
  reviews_count: number;
  is_featured: boolean;
  is_new?: boolean | null;
  is_favorite?: boolean | null;
  shades?: Shade[] | null;
  highlights?: string[] | null;
  ingredients?: string | null;
  how_to?: string[] | null;
  faqs?: { q: string; a: string }[] | null;
  tags?: string[] | null;
  created_at: string;
  categories: { slug: string } | null;
  subcategories: { slug: string; name: string } | null;
  product_images: { storage_path: string; is_primary: boolean; position: number }[] | null;
};

type CategoryRow = {
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  image_url: string | null;
  tone: Category["tone"];
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  coming_soon: boolean;
  position: number;
  /** Embebidas por PostgREST; RLS ya deja fuera las inactivas. */
  subcategories:
    | { slug: string; name: string; position: number; is_active: boolean }[]
    | null;
};

const SELECT =
  "*, categories(slug), subcategories(slug, name), product_images(storage_path, is_primary, position)";

/** Categorías con su segundo nivel. El orden lo pone la base. */
const CATEGORY_SELECT =
  "slug, name, claim, description, image_url, tone, icon, seo_title, seo_description, coming_soon, position, subcategories(slug, name, position, is_active)";

/**
 * Los mismos datos, pero sin lo que añade 0010_catalog_taxonomy.sql.
 *
 * Sirven de red durante la ventana entre desplegar el código y ejecutar la
 * migración: si la base todavía no tiene `subcategories`, `icon` ni el SEO por
 * categoría, la tienda sigue en pie con la estructura anterior en vez de
 * quedarse sin catálogo. Cuando la migración esté aplicada, estas dos consultas
 * no se usan nunca.
 */
const SELECT_PRE_0010 =
  "*, categories(slug), product_images(storage_path, is_primary, position)";
const CATEGORY_SELECT_PRE_0010 =
  "slug, name, claim, description, image_url, tone, coming_soon, position";

/** true cuando el fallo es "esa columna o relación no existe". */
function esEsquemaViejo(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST200" ||
    /column .* does not exist|could not find|relationship/i.test(error.message ?? "")
  );
}

function publicUrl(storagePath: string) {
  return publicClient().storage.from(PRODUCTS_BUCKET).getPublicUrl(storagePath)
    .data.publicUrl;
}

/**
 * La portada es la imagen marcada como principal; detrás, el resto en su
 * orden. La tienda usa `images[0]` para la card e `images[1]` para el efecto
 * al pasar el cursor, así que el orden importa.
 */
function imagesFor(row: CatalogRow): string[] {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.position - b.position);
  const primary = images.findIndex((image) => image.is_primary);
  if (primary > 0) images.unshift(images.splice(primary, 1)[0]);
  return images.map((image) => publicUrl(image.storage_path));
}

function toProduct(row: CatalogRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    category: (row.categories?.slug ?? "") as CategorySlug,
    subcategory: row.subcategories?.name ?? row.subcategory ?? "",
    subcategorySlug: row.subcategories?.slug ?? "",
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: imagesFor(row),
    shades: row.shades?.length ? row.shades : undefined,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    stock: row.stock,
    isNew: row.is_new ?? false,
    isBestseller: row.is_featured,
    isFavorite: row.is_favorite ?? false,
    description: row.description ?? "",
    highlights: row.highlights ?? [],
    ingredients: row.ingredients ?? "",
    howTo: row.how_to ?? [],
    faqs: row.faqs?.length ? row.faqs : undefined,
    tags: row.tags ?? [],
  };
}

function toCategory(row: CategoryRow): Category {
  return {
    slug: row.slug as CategorySlug,
    name: row.name,
    claim: row.claim ?? "",
    description: row.description ?? "",
    image: row.image_url ?? "",
    tone: row.tone,
    icon: row.icon ?? undefined,
    comingSoon: row.coming_soon || undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    // El orden y el filtro de activas los pone la base; aquí solo se ordena
    // por si PostgREST devuelve la relación sin ordenar.
    subcategories: [...(row.subcategories ?? [])]
      .filter((sub) => sub.is_active)
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
      .map((sub) => ({ slug: sub.slug, name: sub.name })),
  };
}

/* ------------------------------------------------------------------ lectura */

/**
 * Todo el catálogo publicado. Es el cimiento de las demás consultas: con
 * veintitantos productos, una sola lectura por petición sale más barata que
 * seis consultas filtradas, y `cache()` evita repetirla.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return [];

  const leer = (select: string) =>
    publicClient()
      .from("products")
      .select(select)
      .eq("status", "published")
      .order("created_at", { ascending: true });

  let { data, error } = await leer(SELECT);

  if (error && esEsquemaViejo(error)) {
    ({ data, error } = await leer(SELECT_PRE_0010));
  }

  if (error) {
    console.error("[catálogo] no se pudo leer products:", error.message);
    return [];
  }

  return ((data as unknown as CatalogRow[] | null) ?? []).map(toProduct);
});

/**
 * Categorías que la tienda muestra.
 *
 * Reglas, todas resueltas aquí para que ninguna vista tenga que acordarse:
 *
 *  · Inactivas fuera. Lo garantiza RLS además de esta consulta.
 *  · Subcategorías inactivas fuera, por la misma política.
 *  · **Una categoría sin producto publicado no se muestra**, salvo que esté
 *    marcada como "muy pronto": ese interruptor es precisamente la forma de
 *    anunciar una categoría todavía vacía. Es la opción más limpia — no hace
 *    falta un ajuste nuevo — y la más escalable: al publicar el primer producto
 *    la categoría aparece sola, y al archivar el último se retira sola.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const [categories, catalog] = await Promise.all([getCategoriesRaw(), getCatalog()]);
  const conProducto = new Set(catalog.map((product) => product.category));

  return categories.filter(
    (category) => category.comingSoon || conProducto.has(category.slug),
  );
});

/** Todas las activas, incluso vacías. La usan el sitemap y las páginas de categoría. */
export const getCategoriesRaw = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return [];

  const leer = (select: string) =>
    publicClient()
      .from("categories")
      .select(select)
      .eq("is_active", true)
      .order("position", { ascending: true });

  let { data, error } = await leer(CATEGORY_SELECT);

  if (error && esEsquemaViejo(error)) {
    ({ data, error } = await leer(CATEGORY_SELECT_PRE_0010));
  }

  if (error) {
    console.error("[catálogo] no se pudo leer categories:", error.message);
    return [];
  }

  return ((data as unknown as CategoryRow[] | null) ?? []).map(toCategory);
});

/**
 * Una categoría por slug. Busca entre todas las activas —no solo entre las que
 * hoy tienen producto— para que su página siga existiendo mientras se surte.
 */
export const getCategory = cache(async (slug: string): Promise<Category | undefined> => {
  const categories = await getCategoriesRaw();
  return categories.find((category) => category.slug === slug);
});

export const getProduct = cache(async (slug: string): Promise<Product | undefined> => {
  const catalog = await getCatalog();
  return catalog.find((product) => product.slug === slug);
});

export const getProductsBySlugs = cache(async (slugs: string[]): Promise<Product[]> => {
  const catalog = await getCatalog();
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));
  return slugs.map((slug) => bySlug.get(slug)).filter((p): p is Product => Boolean(p));
});

export const getProductsByCategory = cache(async (slug: string): Promise<Product[]> => {
  const catalog = await getCatalog();
  return catalog.filter((product) => product.category === slug);
});

export const getBestsellers = cache(async () =>
  (await getCatalog()).filter((product) => product.isBestseller),
);

export const getNewArrivals = cache(async () =>
  (await getCatalog()).filter((product) => product.isNew),
);

export const getFavorites = cache(async () =>
  (await getCatalog()).filter((product) => product.isFavorite),
);

/** Misma regla que tenía el catálogo estático: misma categoría, luego el resto. */
export const getRelatedProducts = cache(async (slug: string, limit = 4) => {
  const catalog = await getCatalog();
  const product = catalog.find((item) => item.slug === slug);
  if (!product) return [];

  const sameCategory = catalog.filter(
    (item) => item.slug !== slug && item.category === product.category,
  );
  const rest = catalog.filter(
    (item) => item.slug !== slug && item.category !== product.category,
  );

  return [...sameCategory, ...rest].slice(0, limit);
});

/**
 * Rango de precios y subcategorías para los filtros de la tienda.
 *
 * Las subcategorías salen de la taxonomía de la base, no del texto de los
 * productos, y solo entran las que tienen algo publicado detrás: un filtro que
 * no devuelve nada no es un filtro.
 */
export const getCatalogFacets = cache(async () => {
  const [catalog, categories] = await Promise.all([getCatalog(), getCategoriesRaw()]);
  const prices = catalog.map((product) => product.price);
  const conProducto = new Set(
    catalog.map((product) => product.subcategorySlug).filter(Boolean),
  );

  return {
    priceRange: {
      min: 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 100000,
    },
    subcategories: categories.flatMap((category) =>
      category.subcategories
        .filter((sub) => conProducto.has(sub.slug))
        .map((sub) => ({ ...sub, category: category.slug })),
    ),
  };
});

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
  product_images: { storage_path: string; is_primary: boolean; position: number }[] | null;
};

type CategoryRow = {
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  image_url: string | null;
  tone: Category["tone"];
  coming_soon: boolean;
  position: number;
};

const SELECT =
  "*, categories(slug), product_images(storage_path, is_primary, position)";

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
    category: (row.categories?.slug ?? "maquillaje") as CategorySlug,
    subcategory: row.subcategory ?? "",
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
    comingSoon: row.coming_soon || undefined,
    subcategories: [],
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

  const { data, error } = await publicClient()
    .from("products")
    .select(SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[catálogo] no se pudo leer products:", error.message);
    return [];
  }

  return (data as unknown as CatalogRow[] | null ?? []).map(toProduct);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return [];

  const [categories, catalog] = await Promise.all([
    publicClient()
      .from("categories")
      .select("slug, name, claim, description, image_url, tone, coming_soon, position")
      .eq("is_active", true)
      .order("position", { ascending: true }),
    getCatalog(),
  ]);

  if (categories.error) {
    console.error("[catálogo] no se pudo leer categories:", categories.error.message);
    return [];
  }

  return (categories.data as unknown as CategoryRow[]).map((row) => {
    const category = toCategory(row);
    // Las subcategorías se deducen del catálogo: son las que de verdad tienen
    // producto, no una lista que hay que mantener a mano.
    category.subcategories = [
      ...new Set(
        catalog
          .filter((product) => product.category === category.slug)
          .map((product) => product.subcategory),
      ),
    ].filter(Boolean);
    return category;
  });
});

export const getCategory = cache(async (slug: string): Promise<Category | undefined> => {
  const categories = await getCategories();
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

/** Rango de precios y subcategorías para los filtros de la tienda. */
export const getCatalogFacets = cache(async () => {
  const catalog = await getCatalog();
  const prices = catalog.map((product) => product.price);

  return {
    priceRange: {
      min: 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 100000,
    },
    subcategories: [...new Set(catalog.map((product) => product.subcategory))].filter(Boolean),
  };
});

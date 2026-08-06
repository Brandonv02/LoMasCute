import "server-only";

import { adminClient } from "@/lib/supabase/client";
import type { ProductRow, ProductStatus } from "@/lib/supabase/types";
import { publicUrlFor, removeAllProductImages } from "@/services/product-images";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Servicio de productos: la única puerta a la tabla `products`.
 *
 * Devuelve tipos del dominio en camelCase, no filas de Postgres. Así los
 * componentes no saben cómo se llaman las columnas y renombrar una no obliga
 * a tocar la interfaz.
 */

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  /** Enlace a la subcategoría; `subcategory` es solo su nombre para mostrar. */
  subcategoryId: string | null;
  subcategory: string | null;
  /** Entero en pesos. COP no usa decimales. */
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  /** Portada: la imagen marcada como principal, o la primera si no hay ninguna */
  imageUrl: string | null;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Lo que guarda el formulario. Coincide 1:1 con los campos pedidos. */
export type ProductInput = {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string | null;
  subcategoryId: string | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
};

export type ProductFilters = {
  search?: string;
  status?: ProductStatus | "all";
  categoryId?: string;
};

export type ProductStats = {
  total: number;
  published: number;
  drafts: number;
  discounted: number;
  outOfStock: number;
  catalogValue: number;
};

/** Filas con la categoría embebida por la relación (`categories(name)`). */
type ProductRowWithCategory = ProductRow & {
  categories: { name: string } | null;
  product_images: { storage_path: string; is_primary: boolean; position: number }[] | null;
};

const SELECT = "*, categories(name), product_images(storage_path, is_primary, position)";

function toProduct(row: ProductRowWithCategory): Product {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.position - b.position);
  const cover = images.find((image) => image.is_primary) ?? images[0];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    subcategoryId: row.subcategory_id,
    subcategory: row.subcategory,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    status: row.status,
    isFeatured: row.is_featured,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    imageUrl: cover ? publicUrlFor(cover.storage_path) : null,
    imageCount: images.length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * true cuando el fallo es "esa columna no existe".
 *
 * Cubre la ventana entre desplegar el código y ejecutar
 * 0010_catalog_taxonomy.sql: si la base todavía no tiene `subcategory_id`, el
 * producto se guarda sin ese campo en vez de romper el formulario.
 */
function faltaLaColumna(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /subcategory_id/.test(error.message ?? "")
  );
}

/** Traduce el input del formulario a columnas. Un solo sitio que lo sepa. */
function toColumns(input: ProductInput) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    category_id: input.categoryId,
    subcategory_id: input.subcategoryId,
    stock: input.stock,
    status: input.status,
    is_featured: input.isFeatured,
  };
}

/* ------------------------------------------------------------------ lectura */

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = adminClient()
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.search?.trim()) {
    // Búsqueda por la columna generada: usa el índice GIN, no un scan.
    query = query.textSearch("search_document", filters.search.trim(), {
      type: "websearch",
      config: "simple",
    });
  }

  const { data, error } = await query;
  if (error) throw toServiceError(error);
  return (data as ProductRowWithCategory[] | null ?? []).map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await adminClient()
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw toServiceError(error);
  return data ? toProduct(data as ProductRowWithCategory) : null;
}

export async function getProductStats(): Promise<ProductStats> {
  const { data, error } = await adminClient()
    .from("products")
    .select("status, price, stock, compare_at_price");

  if (error) throw toServiceError(error);

  const rows = data ?? [];
  return {
    total: rows.length,
    published: rows.filter((row) => row.status === "published").length,
    drafts: rows.filter((row) => row.status === "draft").length,
    discounted: rows.filter((row) => row.compare_at_price !== null).length,
    outOfStock: rows.filter((row) => row.stock === 0).length,
    catalogValue: rows.reduce((sum, row) => sum + row.price * row.stock, 0),
  };
}

/* ---------------------------------------------------------------- escritura */

export async function createProduct(input: ProductInput): Promise<Product> {
  validate(input);

  const columnas = toColumns(input);
  const insertar = (valores: Record<string, unknown>) =>
    adminClient()
      .from("products")
      .insert(valores as never)
      .select(SELECT)
      .single();

  let { data, error } = await insertar(columnas);

  if (error && faltaLaColumna(error)) {
    const { subcategory_id: _omitido, ...sinSubcategoria } = columnas;
    ({ data, error } = await insertar(sinSubcategoria));
  }

  if (error) throw toServiceError(error);
  return toProduct(data as ProductRowWithCategory);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  validate(input);

  const columnas = toColumns(input);
  const actualizar = (valores: Record<string, unknown>) =>
    adminClient()
      .from("products")
      .update(valores as never)
      .eq("id", id)
      .select(SELECT)
      .single();

  let { data, error } = await actualizar(columnas);

  if (error && faltaLaColumna(error)) {
    const { subcategory_id: _omitido, ...sinSubcategoria } = columnas;
    ({ data, error } = await actualizar(sinSubcategoria));
  }

  if (error) throw toServiceError(error);
  return toProduct(data as ProductRowWithCategory);
}

export async function deleteProduct(id: string): Promise<void> {
  // Las filas de `product_images` caen solas por la clave foránea, pero los
  // archivos del bucket no: hay que vaciarlo antes o quedarían huérfanos.
  await removeAllProductImages(id);

  const { error } = await adminClient().from("products").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  const { error } = await adminClient()
    .from("products")
    .update({ status })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

export async function setProductStock(id: string, stock: number): Promise<void> {
  if (!Number.isInteger(stock) || stock < 0) {
    throw new ServiceError("El stock tiene que ser un número entero de 0 o más.");
  }

  const { error } = await adminClient()
    .from("products")
    .update({ stock })
    .eq("id", id);

  if (error) throw toServiceError(error);
}

/* --------------------------------------------------------------- validación */

/**
 * Se valida aquí y no solo en el formulario porque las Server Actions son un
 * endpoint HTTP: cualquiera puede llamarlas sin pasar por la interfaz. La base
 * tiene sus propias restricciones, pero llegar hasta ella para descubrir que
 * el nombre está vacío da un error feo y un viaje de más.
 */
function validate(input: ProductInput) {
  if (!input.name.trim()) throw new ServiceError("El nombre es obligatorio.");
  if (!input.slug.trim()) throw new ServiceError("El slug es obligatorio.");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug.trim())) {
    throw new ServiceError(
      "El slug solo admite minúsculas, números y guiones (por ejemplo: labial-cloud-kiss).",
    );
  }
  if (!Number.isInteger(input.price) || input.price < 0) {
    throw new ServiceError("El precio tiene que ser un número entero de 0 o más.");
  }
  if (
    input.compareAtPrice !== null &&
    (!Number.isInteger(input.compareAtPrice) || input.compareAtPrice <= input.price)
  ) {
    throw new ServiceError("El precio anterior tiene que ser mayor que el precio actual.");
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new ServiceError("El stock tiene que ser un número entero de 0 o más.");
  }
}

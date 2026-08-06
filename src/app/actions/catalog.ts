"use server";

import type { Category, Product } from "@/lib/types";
import {
  getBestsellers,
  getCatalog,
  getCategories,
  getProductsBySlugs,
} from "@/services/catalog";

/**
 * Puente para los componentes de cliente que necesitan catálogo.
 *
 * El buscador, los favoritos y el comparador guardan slugs en localStorage, así
 * que el servidor no puede saber de antemano qué productos hacen falta: los
 * piden desde el navegador cuando ya saben cuáles son.
 *
 * Van por Server Action y no por el cliente de Supabase en el navegador para
 * no publicar credenciales ni duplicar la capa de datos.
 */

/**
 * Lo que necesita el buscador: el catálogo para la puntuación tolerante —que
 * sigue corriendo en el navegador, con la misma indulgencia de siempre— y las
 * categorías de los accesos rápidos.
 */
export async function fetchSearchData(): Promise<{
  products: Product[];
  categories: Category[];
}> {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  return { products, categories };
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return [];
  return getProductsBySlugs(slugs);
}

/** Sugerencias cuando la lista de favoritos está vacía. */
export async function fetchBestsellers(): Promise<Product[]> {
  return getBestsellers();
}

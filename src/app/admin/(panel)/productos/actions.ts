"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductStatus } from "@/lib/supabase/types";
import { messageFor } from "@/services/errors";
import {
  createProduct,
  deleteProduct,
  setProductStatus,
  setProductStock,
  updateProduct,
  type ProductInput,
} from "@/services/products";

/**
 * Server Actions del módulo Productos.
 *
 * Son la frontera entre la interfaz y los servicios: leen el FormData, lo
 * convierten en un `ProductInput` tipado y traducen cualquier fallo a un
 * mensaje presentable. La lógica de datos vive en `src/services`, no aquí.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

const SECTION = "/admin/productos";

/** Refresca la lista y las vistas que dependen del catálogo. */
function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/admin/categorias");
}

/** "48.900" o "48900" → 48900. Vacío → null. */
function parseMoney(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").replace(/[^\d]/g, "");
  if (!raw) return null;
  return Number(raw);
}

/**
 * El precio anterior depende del interruptor "Tiene descuento".
 *
 * Sin descuento se guarda `null` aunque el formulario mande un valor: el
 * interruptor es la única fuente de verdad. Si no, quitar el descuento de un
 * producto que ya lo tenía dejaría el precio tachado vivo en la tienda.
 */
function parseInput(formData: FormData): ProductInput {
  const hasDiscount = formData.get("hasDiscount") === "on";

  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    price: parseMoney(formData.get("price")) ?? 0,
    compareAtPrice: hasDiscount ? parseMoney(formData.get("compareAtPrice")) : null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    subcategoryId: String(formData.get("subcategoryId") ?? "") || null,
    stock: Number(formData.get("stock") ?? 0),
    status: (String(formData.get("status") ?? "draft") as ProductStatus),
    isFeatured: formData.get("isFeatured") === "on",
  };
}

/**
 * Marcar el descuento y no escribir el precio anterior deja al producto en un
 * estado a medias. El `required` del formulario ya lo impide, pero una Server
 * Action es un endpoint HTTP: se comprueba también aquí.
 *
 * Que el precio anterior sea mayor que el actual lo valida el servicio, que es
 * donde vive esa regla (y la base la respalda con `products_compare_at_higher`).
 */
function discountProblem(formData: FormData): string | null {
  if (formData.get("hasDiscount") !== "on") return null;
  if (parseMoney(formData.get("compareAtPrice")) !== null) return null;
  return "Marcaste que el producto tiene descuento: escribe el precio anterior.";
}

/* ------------------------------------------------------------------ crear */

export async function createProductAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const problem = discountProblem(formData);
  if (problem) return { ok: false, message: problem };

  let id: string;
  try {
    const product = await createProduct(parseInput(formData));
    id = product.id;
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  // Fuera del try: `redirect` funciona lanzando, y atraparlo lo rompería.
  // Va a la ficha, no al listado: es donde se añaden las imágenes, que es lo
  // siguiente que quiere hacer quien acaba de crear un producto.
  refresh();
  redirect(`${SECTION}/${id}?creado=1`);
}

/* ----------------------------------------------------------------- editar */

export async function updateProductAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Falta el identificador del producto." };

  const problem = discountProblem(formData);
  if (problem) return { ok: false, message: problem };

  try {
    await updateProduct(id, parseInput(formData));
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  refresh();
  revalidatePath(`${SECTION}/${id}`);
  redirect(`${SECTION}?actualizado=1`);
}

/* --------------------------------------------------------------- eliminar */

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await deleteProduct(id);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/* ---------------------------------------------------------- cambiar estado */

export async function setProductStatusAction(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  try {
    await setProductStatus(id, status);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/* ----------------------------------------------------------- cambiar stock */

export async function setProductStockAction(
  id: string,
  stock: number,
): Promise<ActionResult> {
  try {
    await setProductStock(id, stock);
    refresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

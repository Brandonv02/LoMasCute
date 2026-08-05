"use server";

import { revalidatePath } from "next/cache";
import { messageFor } from "@/services/errors";
import {
  createUploadTicket,
  registerProductImage,
  removeProductImage,
  reorderProductImages,
  setPrimaryProductImage,
  type ProductImage,
  type UploadTicket,
} from "@/services/product-images";

/**
 * Server Actions del gestor de imágenes.
 *
 * Cada una guarda al momento: subir, reordenar, elegir portada y eliminar son
 * definitivas en cuanto ocurren. No dependen del botón "Guardar" del
 * formulario, que solo se ocupa de los campos del producto.
 */

export type ImageResult<T> = { ok: true; data: T } | { ok: false; message: string };

function refresh(productId: string) {
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
}

/** Paso 1: el servidor firma la subida; el navegador sube el archivo. */
export async function createUploadTicketAction(
  productId: string,
  file: { name: string; type: string; size: number },
): Promise<ImageResult<UploadTicket>> {
  try {
    return { ok: true, data: await createUploadTicket(productId, file) };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/** Paso 2: el archivo ya está en el bucket; lo damos de alta en el catálogo. */
export async function registerImageAction(
  productId: string,
  storagePath: string,
  meta: { width?: number | null; height?: number | null } = {},
): Promise<ImageResult<ProductImage>> {
  try {
    const image = await registerProductImage(productId, storagePath, meta);
    refresh(productId);
    return { ok: true, data: image };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function removeImageAction(
  productId: string,
  imageId: string,
): Promise<ImageResult<null>> {
  try {
    await removeProductImage(imageId);
    refresh(productId);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function reorderImagesAction(
  productId: string,
  orderedIds: string[],
): Promise<ImageResult<null>> {
  try {
    await reorderProductImages(productId, orderedIds);
    refresh(productId);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function setPrimaryImageAction(
  productId: string,
  imageId: string,
): Promise<ImageResult<null>> {
  try {
    await setPrimaryProductImage(productId, imageId);
    refresh(productId);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

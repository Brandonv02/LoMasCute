import "server-only";

import { adminClient, PRODUCTS_BUCKET } from "@/lib/supabase/client";
import type { ProductImageRow } from "@/lib/supabase/types";
import {
  IMAGE_EXTENSIONS,
  MAX_IMAGES_PER_PRODUCT,
  imageRejectionReason,
  isAllowedImageType,
  type ProductImage,
} from "@/lib/product-images";
import { ServiceError, toServiceError } from "@/services/errors";

export type { ProductImage };

/**
 * Servicio de imágenes de producto.
 *
 * La subida no pasa por el servidor de Next: este servicio firma una URL de
 * subida con `service_role` y el navegador sube el archivo directamente a
 * Storage. Así el archivo no cruza dos veces la red, no choca con el límite de
 * tamaño de las Server Actions y se puede medir el progreso real byte a byte.
 *
 * El registro en `product_images` sí vuelve al servidor: es lo que convierte un
 * objeto suelto del bucket en una imagen del catálogo.
 */

export function publicUrlFor(storagePath: string) {
  return adminClient().storage.from(PRODUCTS_BUCKET).getPublicUrl(storagePath)
    .data.publicUrl;
}

function toImage(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    url: publicUrlFor(row.storage_path),
    alt: row.alt,
    position: row.position,
    isPrimary: row.is_primary,
    width: row.width,
    height: row.height,
  };
}

/* ------------------------------------------------------------------ lectura */

export async function listProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await adminClient()
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw toServiceError(error);
  return (data ?? []).map(toImage);
}

/* ------------------------------------------------------------------ subida */

export type UploadTicket = {
  /** Ruta definitiva dentro del bucket */
  path: string;
  /** URL firmada a la que el navegador hace PUT */
  signedUrl: string;
};

/**
 * Firma una subida. Valida aquí y no solo en el navegador porque las Server
 * Actions son un endpoint HTTP: cualquiera puede llamarlas sin pasar por la
 * interfaz.
 */
export async function createUploadTicket(
  productId: string,
  file: { name: string; type: string; size: number },
): Promise<UploadTicket> {
  const rejection = imageRejectionReason(file);
  if (rejection) throw new ServiceError(rejection);
  if (!isAllowedImageType(file.type)) throw new ServiceError("Formato no admitido.");

  const client = adminClient();

  const { count, error: countError } = await client
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) throw toServiceError(countError);
  if ((count ?? 0) >= MAX_IMAGES_PER_PRODUCT) {
    throw new ServiceError(
      `Este producto ya tiene ${MAX_IMAGES_PER_PRODUCT} imágenes, que es el máximo.`,
    );
  }

  // Nombre opaco: evita colisiones y no filtra el nombre del archivo original.
  const path = `${productId}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;

  const { data, error } = await client.storage
    .from(PRODUCTS_BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw new ServiceError(`No se pudo preparar la subida: ${error.message}`);
  return { path, signedUrl: data.signedUrl };
}

/**
 * Registra en la base un objeto ya subido. La primera imagen de un producto se
 * marca como principal sola: una ficha sin portada no tiene sentido.
 */
export async function registerProductImage(
  productId: string,
  storagePath: string,
  meta: { alt?: string | null; width?: number | null; height?: number | null } = {},
): Promise<ProductImage> {
  const client = adminClient();

  const { data: existing, error: existingError } = await client
    .from("product_images")
    .select("position, is_primary")
    .eq("product_id", productId);

  if (existingError) throw toServiceError(existingError);

  const rows = existing ?? [];
  const nextPosition = rows.reduce((max, row) => Math.max(max, row.position + 1), 0);
  const hasPrimary = rows.some((row) => row.is_primary);

  const insert = (isPrimary: boolean) =>
    client
      .from("product_images")
      .insert({
        product_id: productId,
        storage_path: storagePath,
        alt: meta.alt ?? null,
        width: meta.width ?? null,
        height: meta.height ?? null,
        position: nextPosition,
        is_primary: isPrimary,
      })
      .select("*")
      .single();

  let { data, error } = await insert(!hasPrimary);

  // Dos subidas simultáneas pueden creerse ambas la primera. El índice único
  // lo impide; aquí simplemente cedemos y entramos como secundaria.
  if (error && error.message.includes("product_images_one_primary_idx")) {
    ({ data, error } = await insert(false));
  }

  if (error) throw toServiceError(error);
  return toImage(data as ProductImageRow);
}

/* -------------------------------------------------------------- mutaciones */

export async function removeProductImage(imageId: string): Promise<void> {
  const client = adminClient();

  const { data: image, error: findError } = await client
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .maybeSingle();

  if (findError) throw toServiceError(findError);
  if (!image) throw new ServiceError("Esa imagen ya no existe.");

  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) throw toServiceError(deleteError);

  // Primero la fila y después el objeto: si el borrado del archivo falla, nos
  // queda un archivo huérfano (invisible y barato) en vez de una fila apuntando
  // a algo que ya no está (una imagen rota en la ficha).
  await client.storage.from(PRODUCTS_BUCKET).remove([image.storage_path]);

  // Si se fue la principal, asciende la siguiente para que la ficha no se quede
  // sin portada.
  if (image.is_primary) {
    const { data: next } = await client
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await client.from("product_images").update({ is_primary: true }).eq("id", next.id);
    }
  }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[],
): Promise<void> {
  const client = adminClient();

  const { data: owned, error } = await client
    .from("product_images")
    .select("id")
    .eq("product_id", productId);

  if (error) throw toServiceError(error);

  // No nos fiamos de la lista que llega: solo reordenamos lo que es del producto.
  const valid = new Set((owned ?? []).map((row) => row.id));
  const ids = orderedIds.filter((id) => valid.has(id));

  const results = await Promise.all(
    ids.map((id, index) =>
      client.from("product_images").update({ position: index }).eq("id", id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) throw toServiceError(failed.error);
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  const client = adminClient();

  // El índice único parcial solo admite una principal por producto: hay que
  // apagar la anterior antes de encender la nueva.
  const { error: clearError } = await client
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId)
    .eq("is_primary", true);

  if (clearError) throw toServiceError(clearError);

  const { error } = await client
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) throw toServiceError(error);
}

/**
 * Vacía el bucket para un producto. Las filas caen solas por la clave foránea;
 * los archivos no, y sin esto el bucket acumularía basura invisible.
 */
export async function removeAllProductImages(productId: string): Promise<void> {
  const client = adminClient();

  const { data, error } = await client
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (error) throw toServiceError(error);

  const paths = (data ?? []).map((row) => row.storage_path);
  if (paths.length) {
    await client.storage.from(PRODUCTS_BUCKET).remove(paths);
  }
}

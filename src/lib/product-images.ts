/**
 * Contrato compartido de las imágenes de producto.
 *
 * Vive aquí y no en `src/services/product-images.ts` porque el servicio es
 * `server-only` y el gestor del panel necesita las mismas reglas para validar
 * en el navegador antes de empezar a subir. Un solo sitio donde cambiarlas.
 */

export type ProductImage = {
  id: string;
  productId: string;
  storagePath: string;
  /** URL pública, lista para <Image> */
  url: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
  width: number | null;
  height: number | null;
};

/** Debe coincidir con lo declarado en supabase/migrations/0003_storage.sql */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Tope por producto: una ficha con más de esto no se lee, se hojea. */
export const MAX_IMAGES_PER_PRODUCT = 8;

export const IMAGE_EXTENSIONS: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Mensaje único para los dos lados de la validación. */
export function imageRejectionReason(file: {
  name: string;
  type: string;
  size: number;
}): string | null {
  if (!isAllowedImageType(file.type)) {
    return `"${file.name}": formato no admitido. Usa JPG, PNG, WebP, AVIF o SVG.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}": pesa demasiado. El máximo por imagen es 5 MB.`;
  }
  return null;
}

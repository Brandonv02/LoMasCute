import "server-only";

import { cache } from "react";
import {
  adminClient,
  isSupabaseConfigured,
  publicClient,
} from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import {
  EMPTY_SITE_SETTINGS,
  EMPTY_SITE_SETTINGS_VIEW,
  HERO_FOLDER,
  SETTING_KEYS,
  SITE_BUCKET,
  settingsFromRows,
  settingsToRows,
  type SiteSettings,
  type SiteSettingsView,
} from "@/lib/site-settings";
import {
  IMAGE_EXTENSIONS,
  imageRejectionReason,
  isAllowedImageType,
} from "@/lib/product-images";
import { ServiceError, toServiceError } from "@/services/errors";

/**
 * Ajustes de la tienda.
 *
 * La lectura usa el cliente anónimo: los ajustes son públicos y así RLS sigue
 * siendo la frontera de verdad. La escritura usa `service_role` y solo ocurre
 * desde las Server Actions del panel.
 *
 * `cache()` deduplica dentro de una misma petición: el layout (footer y redes
 * flotantes) y la portada piden lo mismo y viaja una sola vez.
 */

/* ------------------------------------------------------------------ lectura */

function heroUrl(path: string): string | null {
  if (!path) return null;
  return publicClient().storage.from(SITE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Lo que consume la tienda pública. Nunca lanza: sin base, todo vacío. */
export const getSiteSettings = cache(async (): Promise<SiteSettingsView> => {
  if (!isSupabaseConfigured()) return EMPTY_SITE_SETTINGS_VIEW;

  const { data, error } = await publicClient()
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("[configuración] no se pudo leer site_settings:", error.message);
    return EMPTY_SITE_SETTINGS_VIEW;
  }

  const settings = settingsFromRows(data ?? []);
  return { ...settings, heroImageUrl: heroUrl(settings.heroImagePath) };
});

/**
 * Lo que edita el panel. Aquí sí interesa que un fallo se vea: si la base no
 * responde, el formulario no debe pintar campos vacíos como si estuvieran así
 * guardados.
 */
export async function getSiteSettingsForAdmin(): Promise<SiteSettingsView> {
  const { data, error } = await adminClient()
    .from("site_settings")
    .select("key, value");

  if (error) throw toServiceError(error);

  const settings = settingsFromRows(data ?? []);
  return { ...settings, heroImageUrl: heroUrl(settings.heroImagePath) };
}

/* ---------------------------------------------------------------- escritura */

/**
 * Guarda los ajustes. La imagen del hero no entra aquí: se administra por su
 * cuenta (subir y quitar son definitivos en cuanto ocurren, igual que en el
 * gestor de imágenes de producto).
 */
export async function saveSiteSettings(
  input: Omit<SiteSettings, "heroImagePath">,
): Promise<void> {
  const current = await getSiteSettingsForAdmin();

  // `settingsToRows` necesita el objeto completo; la ruta de la imagen se
  // conserva tal cual está en la base.
  const rows = settingsToRows({
    ...EMPTY_SITE_SETTINGS,
    ...input,
    heroImagePath: current.heroImagePath,
  });

  const { error } = await adminClient()
    .from("site_settings")
    .upsert(
      rows.map((row) => ({ key: row.key, value: row.value as Json })),
      { onConflict: "key" },
    );

  if (error) throw toServiceError(error);
}

/* ------------------------------------------------------- imagen del hero */

export type UploadTicket = {
  /** Ruta definitiva dentro del bucket */
  path: string;
  /** URL firmada a la que el navegador hace PUT */
  signedUrl: string;
};

/**
 * Firma la subida de la imagen del hero. Se valida aquí y no solo en el
 * navegador porque una Server Action es un endpoint HTTP: cualquiera puede
 * llamarla sin pasar por la interfaz.
 */
export async function createHeroUploadTicket(file: {
  name: string;
  type: string;
  size: number;
}): Promise<UploadTicket> {
  const rejection = imageRejectionReason(file);
  if (rejection) throw new ServiceError(rejection);
  if (!isAllowedImageType(file.type)) throw new ServiceError("Formato no admitido.");

  // Nombre opaco: evita colisiones y no filtra el nombre del archivo original.
  const path = `${HERO_FOLDER}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;

  const { data, error } = await adminClient()
    .storage.from(SITE_BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw new ServiceError(`No se pudo preparar la subida: ${error.message}`);
  return { path, signedUrl: data.signedUrl };
}

/** Deja el objeto ya subido como imagen del hero y retira el anterior. */
export async function setHeroImage(storagePath: string): Promise<string> {
  const previous = (await getSiteSettingsForAdmin()).heroImagePath;

  const { error } = await adminClient()
    .from("site_settings")
    .upsert(
      { key: SETTING_KEYS.heroImagePath, value: storagePath },
      { onConflict: "key" },
    );

  if (error) throw toServiceError(error);

  // Primero la fila y después el archivo: si el borrado falla nos queda un
  // objeto huérfano (invisible y barato) en vez de un hero roto en la portada.
  if (previous && previous !== storagePath) {
    await adminClient().storage.from(SITE_BUCKET).remove([previous]);
  }

  return publicClient().storage.from(SITE_BUCKET).getPublicUrl(storagePath).data
    .publicUrl;
}

/** Quita la imagen del hero. La portada oculta el bloque cuando no hay. */
export async function removeHeroImage(): Promise<void> {
  const previous = (await getSiteSettingsForAdmin()).heroImagePath;

  const { error } = await adminClient()
    .from("site_settings")
    .upsert({ key: SETTING_KEYS.heroImagePath, value: "" }, { onConflict: "key" });

  if (error) throw toServiceError(error);

  if (previous) {
    await adminClient().storage.from(SITE_BUCKET).remove([previous]);
  }
}

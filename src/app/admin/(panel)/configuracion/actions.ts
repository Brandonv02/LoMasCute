"use server";

import { revalidatePath } from "next/cache";
import {
  normalizeSocialUrl,
  normalizeWhatsapp,
  type SiteSettings,
} from "@/lib/site-settings";
import { messageFor } from "@/services/errors";
import {
  createHeroUploadTicket,
  removeHeroImage,
  saveSiteSettings,
  setHeroImage,
  type UploadTicket,
} from "@/services/site-settings";

/**
 * Server Actions del módulo Configuración.
 *
 * Leen el FormData, lo normalizan (un handle de Instagram vale tanto como la
 * URL completa) y traducen cualquier fallo a un mensaje presentable. La lógica
 * de datos vive en `src/services/site-settings.ts`.
 */

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; message: string };

/**
 * Los ajustes se pintan en la portada y en el decorado de todas las páginas
 * (footer y redes flotantes), así que se revalida el layout completo.
 */
function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
}

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

function parseInput(formData: FormData): Omit<SiteSettings, "heroImagePath"> {
  return {
    storeName: field(formData, "storeName"),
    storeDescription: field(formData, "storeDescription"),

    heroTitle: field(formData, "heroTitle"),
    heroSubtitle: field(formData, "heroSubtitle"),
    heroCtaLabel: field(formData, "heroCtaLabel"),
    heroCtaHref: field(formData, "heroCtaHref"),

    instagramUrl: normalizeSocialUrl(field(formData, "instagramUrl"), "instagram.com"),
    tiktokUrl: normalizeSocialUrl(field(formData, "tiktokUrl"), "tiktok.com"),
    facebookUrl: normalizeSocialUrl(field(formData, "facebookUrl"), "facebook.com"),
    whatsappNumber: normalizeWhatsapp(field(formData, "whatsappNumber")),
    contactEmail: field(formData, "contactEmail"),

    // Una entrada por método; las vacías se caen solas.
    paymentMethods: formData
      .getAll("paymentMethods")
      .map((value) => String(value).trim())
      .filter(Boolean),

    shippingText: field(formData, "shippingText"),
    deliveryTime: field(formData, "deliveryTime"),
  };
}

/* ---------------------------------------------------------------- guardar */

export async function saveSettingsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await saveSiteSettings(parseInput(formData));
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  refresh();
  return { ok: true, data: null };
}

/* ------------------------------------------------------- imagen del hero */

/** Paso 1: el servidor firma la subida; el navegador sube el archivo. */
export async function createHeroUploadTicketAction(file: {
  name: string;
  type: string;
  size: number;
}): Promise<ActionResult<UploadTicket>> {
  try {
    return { ok: true, data: await createHeroUploadTicket(file) };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/** Paso 2: el archivo ya está en el bucket; pasa a ser el hero de la portada. */
export async function setHeroImageAction(
  storagePath: string,
): Promise<ActionResult<string>> {
  try {
    const url = await setHeroImage(storagePath);
    refresh();
    return { ok: true, data: url };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function removeHeroImageAction(): Promise<ActionResult> {
  try {
    await removeHeroImage();
    refresh();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

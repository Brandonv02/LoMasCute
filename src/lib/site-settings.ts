/**
 * Contrato de los ajustes de la tienda.
 *
 * Vive aquí y no en `src/services/site-settings.ts` porque el servicio es
 * `server-only` y tanto el formulario del panel (cliente) como la portada
 * necesitan la misma forma, los mismos valores por defecto y las mismas reglas
 * para decidir si un dato existe.
 *
 * La base guarda pares clave/valor (ver 0005_site_settings.sql). Este módulo es
 * el único sitio donde ese par se convierte en un campo tipado.
 */

import { FALLBACK_STORE_NAME } from "@/config/app";

export type SiteSettings = {
  /** Nombre de la tienda */
  storeName: string;
  /** Razón social. Aparece en los documentos legales. */
  legalName: string;
  /** Eslogan corto: pantalla de bienvenida y menú */
  tagline: string;
  /** Ciudad de operación: envíos, checkout y documentos legales */
  storeCity: string;
  /** Descripción corta: SEO y textos de marca */
  storeDescription: string;

  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  /** Ruta dentro del bucket "site", no la URL: el dominio puede cambiar. */
  heroImagePath: string;

  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  /** Solo dígitos, con indicativo: 573001234567 */
  whatsappNumber: string;
  contactEmail: string;
  /** Fijo o celular de atención, tal como se quiere mostrar */
  contactPhone: string;
  /** Horario de atención en texto libre */
  businessHours: string;
  /** Dirección física. Vacía si la tienda no atiende al público. */
  storeAddress: string;

  paymentMethods: string[];
  shippingText: string;
  deliveryTime: string;
  /** Cobertura de entrega, en texto: "Medellín y Área Metropolitana" */
  shippingZone: string;
  /** Costo del domicilio en pesos. 0 = todavía sin definir. */
  shippingPrice: number;
  /** Compra mínima para envío gratis. 0 = no hay envío gratis. */
  freeShippingFrom: number;
  /** Barrios o municipios que se ofrecen en el checkout */
  shippingNeighborhoods: string[];
};

/** Lo que consume la tienda: los ajustes más la URL ya resuelta del hero. */
export type SiteSettingsView = SiteSettings & {
  heroImageUrl: string | null;
};

/** Clave en `site_settings` para cada campo. */
export const SETTING_KEYS = {
  storeName: "store_name",
  legalName: "legal_name",
  tagline: "tagline",
  storeCity: "store_city",
  storeDescription: "store_description",
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
  heroCtaLabel: "hero_cta_label",
  heroCtaHref: "hero_cta_href",
  heroImagePath: "hero_image_path",
  instagramUrl: "instagram_url",
  tiktokUrl: "tiktok_url",
  facebookUrl: "facebook_url",
  whatsappNumber: "whatsapp_number",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
  businessHours: "business_hours",
  storeAddress: "store_address",
  paymentMethods: "payment_methods",
  shippingText: "shipping_text",
  deliveryTime: "delivery_time",
  shippingZone: "shipping_zone",
  shippingPrice: "shipping_price",
  freeShippingFrom: "free_shipping_from",
  shippingNeighborhoods: "shipping_neighborhoods",
} as const satisfies Record<keyof SiteSettings, string>;

export type SettingField = keyof typeof SETTING_KEYS;

/**
 * Vacío, no de ejemplo.
 *
 * Es deliberado que no haya un solo texto de relleno: la portada oculta lo que
 * no tenga dato, así que un valor por defecto "bonito" sería contenido falso
 * disfrazado de configuración.
 */
export const EMPTY_SITE_SETTINGS: SiteSettings = {
  storeName: "",
  legalName: "",
  tagline: "",
  storeCity: "",
  storeDescription: "",
  heroTitle: "",
  heroSubtitle: "",
  heroCtaLabel: "",
  heroCtaHref: "",
  heroImagePath: "",
  instagramUrl: "",
  tiktokUrl: "",
  facebookUrl: "",
  whatsappNumber: "",
  contactEmail: "",
  contactPhone: "",
  businessHours: "",
  storeAddress: "",
  paymentMethods: [],
  shippingText: "",
  deliveryTime: "",
  shippingZone: "",
  shippingPrice: 0,
  freeShippingFrom: 0,
  shippingNeighborhoods: [],
};

export const EMPTY_SITE_SETTINGS_VIEW: SiteSettingsView = {
  ...EMPTY_SITE_SETTINGS,
  heroImageUrl: null,
};

/** Bucket de Storage donde vive el arte de la tienda (ver 0005). */
export const SITE_BUCKET = "site";

/** Carpeta del bucket para la imagen principal del hero. */
export const HERO_FOLDER = "hero";

/* ----------------------------------------------------------- conversiones */

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : [];

/** Entero no negativo. Cualquier cosa rara cuenta como "sin definir" (0). */
const amount = (value: unknown): number => {
  const parsed =
    typeof value === "number" ? value : Number(text(value).replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
};

/** Pares de la base → objeto tipado, con lo que falte en su valor vacío. */
export function settingsFromRows(
  rows: { key: string; value: unknown }[],
): SiteSettings {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const raw = (field: SettingField) => byKey.get(SETTING_KEYS[field]);

  return {
    storeName: text(raw("storeName")),
    legalName: text(raw("legalName")),
    tagline: text(raw("tagline")),
    storeCity: text(raw("storeCity")),
    storeDescription: text(raw("storeDescription")),
    heroTitle: text(raw("heroTitle")),
    heroSubtitle: text(raw("heroSubtitle")),
    heroCtaLabel: text(raw("heroCtaLabel")),
    heroCtaHref: text(raw("heroCtaHref")),
    heroImagePath: text(raw("heroImagePath")),
    instagramUrl: text(raw("instagramUrl")),
    tiktokUrl: text(raw("tiktokUrl")),
    facebookUrl: text(raw("facebookUrl")),
    whatsappNumber: normalizeWhatsapp(text(raw("whatsappNumber"))),
    contactEmail: text(raw("contactEmail")),
    contactPhone: text(raw("contactPhone")),
    businessHours: text(raw("businessHours")),
    storeAddress: text(raw("storeAddress")),
    paymentMethods: list(raw("paymentMethods")),
    shippingText: text(raw("shippingText")),
    deliveryTime: text(raw("deliveryTime")),
    shippingZone: text(raw("shippingZone")),
    shippingPrice: amount(raw("shippingPrice")),
    freeShippingFrom: amount(raw("freeShippingFrom")),
    shippingNeighborhoods: list(raw("shippingNeighborhoods")),
  };
}

/** Objeto tipado → pares listos para el `upsert`. */
export function settingsToRows(
  settings: SiteSettings,
): { key: string; value: string | string[] | number }[] {
  return (Object.keys(SETTING_KEYS) as SettingField[]).map((field) => ({
    key: SETTING_KEYS[field],
    value: settings[field],
  }));
}

/* --------------------------------------------------------------- utilidades */

/**
 * Nombre visible de la tienda. Mientras nadie lo haya guardado se usa un
 * respaldo neutro: la pestaña del navegador necesita un título, pero inventar
 * una marca sería contenido falso.
 */
export function storeLabel(settings: Pick<SiteSettings, "storeName">): string {
  return settings.storeName || FALLBACK_STORE_NAME;
}

/** "+57 300 123 4567" → "573001234567". WhatsApp solo entiende dígitos. */
export function normalizeWhatsapp(value: string): string {
  return value.replace(/\D/g, "");
}

/** Acepta "@lomascute", "instagram.com/lomascute" o la URL completa. */
export function normalizeSocialUrl(value: string, host: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("@")) return `https://${host}/${raw.slice(1)}`;
  if (raw.startsWith(`${host}/`) || raw.startsWith(`www.${host}/`)) {
    return `https://${raw.replace(/^www\./, "")}`;
  }
  return `https://${host}/${raw.replace(/^\/+/, "")}`;
}

export function whatsappUrl(number: string, message?: string): string {
  const digits = normalizeWhatsapp(number);
  if (!digits) return "";
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}

/**
 * `tel:` a partir de lo que escribió el panel. Se conserva el `+` inicial si
 * lo hay: añadirlo por nuestra cuenta convertiría un fijo local en un número
 * internacional inexistente.
 */
export function telHref(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const plus = raw.startsWith("+") ? "+" : "";
  const digits = raw.replace(/\D/g, "");
  return digits ? `tel:${plus}${digits}` : "";
}

/** Mapa embebido de una dirección. Sin dirección no hay mapa. */
export function mapEmbedUrl(address: string): string {
  const query = address.trim();
  if (!query) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** Formato legible del número: 573001234567 → "+57 300 123 4567". */
export function formatWhatsapp(number: string): string {
  const digits = normalizeWhatsapp(number);
  if (digits.length !== 12) return digits ? `+${digits}` : "";
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

export type SocialLink = {
  name: string;
  url: string;
  /** Coincide con las claves de `socialIcons` */
  icon: "whatsapp" | "instagram" | "tiktok" | "facebook";
};

/**
 * Las redes que de verdad están configuradas, en el orden en que la marca las
 * usa. Lo que no se ha rellenado, sencillamente no existe: nadie ve un enlace
 * roto ni un perfil inventado.
 */
export function socialLinks(settings: SiteSettings): SocialLink[] {
  const links: SocialLink[] = [];
  const whatsapp = whatsappUrl(settings.whatsappNumber);

  if (whatsapp) links.push({ name: "WhatsApp", url: whatsapp, icon: "whatsapp" });
  if (settings.instagramUrl)
    links.push({ name: "Instagram", url: settings.instagramUrl, icon: "instagram" });
  if (settings.tiktokUrl)
    links.push({ name: "TikTok", url: settings.tiktokUrl, icon: "tiktok" });
  if (settings.facebookUrl)
    links.push({ name: "Facebook", url: settings.facebookUrl, icon: "facebook" });

  return links;
}

/** Último tramo de una URL de perfil: sirve de arroba a mostrar. */
export function socialHandle(url: string): string {
  if (!url) return "";
  const path = url
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .split("/")
    .slice(1)
    .join("/");
  if (!path) return "";
  return path.startsWith("@") ? path : `@${path}`;
}

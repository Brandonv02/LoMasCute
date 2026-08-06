/**
 * Constantes de la aplicación.
 *
 * Aquí vive únicamente lo que **no** es información de la tienda: la URL del
 * despliegue, el idioma, la moneda, el país de operación y las rutas del sitio.
 *
 * Todo lo que una persona puede querer cambiar sin tocar código —nombre, razón
 * social, eslogan, ciudad, contacto, redes, envíos y pagos— vive en
 * `site_settings` y se administra desde /admin/configuracion. Si un dato no
 * está guardado ahí, la tienda lo oculta: no hay valores de ejemplo.
 */

/** Dominio del despliegue. Se sobreescribe con NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://lomascute.co"
).replace(/\/+$/, "");

export const LOCALE = "es_CO";
export const LANGUAGE = "es-CO";
export const CURRENCY = "COP";
/** ISO 3166-1 del país donde opera la tienda: envíos y política de garantías. */
export const COUNTRY_CODE = "CO";

/**
 * Nombre genérico para la pestaña y los textos accesibles mientras nadie haya
 * guardado el nombre real en el panel. Es deliberadamente neutro: inventar una
 * marca sería peor que no decir nada.
 */
export const FALLBACK_STORE_NAME = "Tienda";

/** Navegación principal: estructura del sitio, no contenido administrable. */
export const MAIN_NAV = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/tienda" },
  { label: "Categorías", href: "/#categorias" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;

/** Documentos legales publicados, en el orden en que se listan. */
export const LEGAL_LINKS = [
  { label: "Políticas de envío", href: "/legal/envios" },
  { label: "Cambios y devoluciones", href: "/legal/devoluciones" },
  { label: "Términos y condiciones", href: "/legal/terminos" },
  { label: "Política de privacidad", href: "/legal/privacidad" },
] as const;

/**
 * Configuración única de la marca.
 * Cambiar aquí actualiza toda la tienda: SEO, redes, envíos y pagos.
 */

export const site = {
  name: "Lo Más Cute",
  legalName: "Lo Más Cute S.A.S.",
  /** Eslogan principal (hero) */
  tagline: "Cosas lindas para tu día a día",
  /** Promesa de marca, lifestyle: no encasilla a maquillaje */
  promise:
    "Una tienda pensada para que todo lo que uses, guardes y regales se sienta un poquito más lindo.",
  description:
    "Lo Más Cute es una tienda lifestyle de Medellín: maquillaje, skincare, accesorios, papelería, perfumes y regalos elegidos con muchísimo cariño. Envíos en Medellín y pago con Nequi, Bancolombia o transferencia.",
  url: "https://lomascute.co",
  locale: "es_CO",
  currency: "COP",
  city: "Medellín",
  country: "Colombia",

  contact: {
    email: "hola@lomascute.co",
    /** ⚠️ Reemplazar por el número real antes de publicar */
    whatsapp: "573000000000",
    whatsappDisplay: "+57 300 000 0000",
    phoneDisplay: "+57 300 000 0000",
    address: "Cra. 43A #1-50, El Poblado · Medellín",
    schedule: "Lunes a sábado · 9:00 a.m. – 7:00 p.m.",
    mapQuery: "El Poblado, Medellín, Colombia",
  },

  social: [
    { name: "WhatsApp", handle: "Escríbenos", url: "https://wa.me/573000000000", icon: "whatsapp" },
    { name: "Instagram", handle: "@lomascute", url: "https://instagram.com/lomascute", icon: "instagram" },
    { name: "TikTok", handle: "@lomascute", url: "https://tiktok.com/@lomascute", icon: "tiktok" },
    { name: "Facebook", handle: "Lo Más Cute", url: "https://facebook.com/lomascute", icon: "facebook" },
    { name: "YouTube", handle: "Lo Más Cute", url: "https://youtube.com/@lomascute", icon: "youtube" },
    { name: "Pinterest", handle: "@lomascute", url: "https://pinterest.com/lomascute", icon: "pinterest" },
    { name: "Threads", handle: "@lomascute", url: "https://threads.net/@lomascute", icon: "threads" },
  ],

  shipping: {
    /** Cobertura activa hoy. Estructura lista para sumar ciudades. */
    zones: [
      {
        id: "medellin",
        label: "Medellín y Área Metropolitana",
        price: 8900,
        freeFrom: 120000,
        eta: "24 a 48 horas hábiles",
        active: true,
        neighborhoods: [
          "El Poblado",
          "Laureles",
          "Envigado",
          "Sabaneta",
          "Belén",
          "La América",
          "Estadio",
          "Robledo",
          "Castilla",
          "Buenos Aires",
          "Manrique",
          "Itagüí",
          "Bello",
          "La Estrella",
          "Otro barrio de Medellín",
        ],
      },
      {
        id: "colombia",
        label: "Resto de Colombia",
        price: 0,
        freeFrom: 0,
        eta: "Muy pronto",
        active: false,
        neighborhoods: [],
      },
    ],
  },

  payments: [
    { id: "nequi", label: "Nequi", detail: "Te enviamos el número al confirmar", active: true },
    { id: "bancolombia", label: "Transferencia Bancolombia", detail: "Ahorros a la mano o cuenta de ahorros", active: true },
    { id: "transferencia", label: "Otra transferencia bancaria", detail: "Davivienda, Nu, Lulo, Daviplata", active: true },
    { id: "mercadopago", label: "Mercado Pago", detail: "Próximamente", active: false },
    { id: "wompi", label: "Wompi", detail: "Próximamente", active: false },
    { id: "payu", label: "PayU", detail: "Próximamente", active: false },
    { id: "stripe", label: "Stripe", detail: "Próximamente", active: false },
  ],

  nav: [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/tienda" },
    { label: "Categorías", href: "/#categorias" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],

  legal: [
    { label: "Políticas de envío", href: "/legal/envios" },
    { label: "Cambios y devoluciones", href: "/legal/devoluciones" },
    { label: "Términos y condiciones", href: "/legal/terminos" },
    { label: "Política de privacidad", href: "/legal/privacidad" },
  ],
} as const;

export type Site = typeof site;

export const activeZone = site.shipping.zones[0];

/** Mensaje precargado para pedidos por WhatsApp */
export function whatsappLink(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

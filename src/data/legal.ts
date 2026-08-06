import { COUNTRY_CODE, SITE_URL } from "@/config/app";
import { formatWhatsapp, storeLabel, type SiteSettings } from "@/lib/site-settings";
import { formatCOP } from "@/lib/utils";

export type LegalDoc = {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

/**
 * Documentos legales redactados para el contexto colombiano (Estatuto del
 * Consumidor, Ley 1581 de protección de datos). Son una base sólida y clara,
 * no un reemplazo de revisión por un abogado antes de publicar.
 *
 * Se construyen a partir de `site_settings`: la razón social, la ciudad, la
 * cobertura, las tarifas, el correo y el WhatsApp llegan del panel. Cuando un
 * dato no está configurado, la frase que lo necesitaba no se escribe —nunca se
 * publica un importe o un contacto inventado en un documento legal.
 */

/** Índice de documentos: sirve para el sitemap y las rutas estáticas. */
export const LEGAL_DOCS = [
  { slug: "envios", title: "Políticas de envío" },
  { slug: "devoluciones", title: "Cambios y devoluciones" },
  { slug: "terminos", title: "Términos y condiciones" },
  { slug: "privacidad", title: "Política de privacidad" },
] as const;

/** Fecha de la última revisión del texto legal (no es un dato de la tienda). */
const UPDATED = "1 de agosto de 2026";

/** Quita las frases que dependían de un dato que nadie ha configurado. */
const lines = (...items: (string | false | undefined)[]): string[] =>
  items.filter((item): item is string => Boolean(item));

export function legalDocs(settings: SiteSettings): LegalDoc[] {
  const name = storeLabel(settings);
  const zone = settings.shippingZone;
  const city = settings.storeCity;
  const email = settings.contactEmail;
  const whatsapp = formatWhatsapp(settings.whatsappNumber);
  const payments = settings.paymentMethods;
  const responsible = settings.legalName || settings.storeName;

  return [
    {
      slug: "envios",
      title: "Políticas de envío",
      intro: zone
        ? `Hoy entregamos en ${zone}.`
        : "Coordinamos cada entrega contigo antes de despachar el pedido.",
      updated: UPDATED,
      sections: [
        {
          heading: "Cobertura actual",
          body: lines(
            zone
              ? `Entregamos en ${zone}.`
              : "Todavía estamos definiendo nuestra cobertura de entrega. Escríbenos antes de pedir y te confirmamos si llegamos a tu dirección.",
            settings.shippingText,
            "Si tu dirección queda fuera de la zona de cobertura, escríbenos antes de pedir. En algunos casos podemos coordinar una entrega especial o guardarte el pedido.",
          ),
        },
        {
          heading: "Costo y tiempos",
          body: lines(
            settings.shippingPrice > 0 &&
              (settings.freeShippingFrom > 0
                ? `El envío cuesta ${formatCOP(settings.shippingPrice)} y es gratis en pedidos superiores a ${formatCOP(settings.freeShippingFrom)}.`
                : `El envío cuesta ${formatCOP(settings.shippingPrice)}.`),
            settings.shippingPrice === 0 &&
              "El costo del domicilio se confirma al coordinar la entrega, antes de que pagues.",
            settings.deliveryTime &&
              `El tiempo estimado de entrega es de ${settings.deliveryTime}.`,
            "Los pedidos hechos en días no hábiles se despachan el siguiente día hábil.",
          ),
        },
        {
          heading: "Confirmación del pago",
          body: lines(
            "El pedido se despacha una vez confirmamos el pago.",
            payments.length > 0
              ? `Trabajamos con ${payments.join(", ")}: te enviamos los datos exactos justo después de que confirmas el pedido.`
              : "Te enviamos los datos para pagar justo después de que confirmas el pedido.",
            "Si no recibimos el pago dentro de 24 horas, liberamos el inventario para otras clientas. Te escribimos antes de hacerlo.",
          ),
        },
        {
          heading: "Seguimiento",
          body: lines(
            "Te avisamos cuando el pedido sale para tu dirección y te compartimos el número de guía si aplica.",
            "Si nadie puede recibir, coordinamos un segundo intento sin costo adicional. A partir del tercer intento sí debemos cobrar de nuevo el domicilio.",
          ),
        },
      ],
    },
    {
      slug: "devoluciones",
      title: "Cambios y devoluciones",
      intro:
        "Queremos que ames lo que pediste. Si algo no salió bien, lo resolvemos.",
      updated: UPDATED,
      sections: [
        {
          heading: "Derecho de retracto",
          body: lines(
            "Conforme al Estatuto del Consumidor (Ley 1480 de 2011), en compras a distancia tienes cinco (5) días hábiles desde que recibes el pedido para ejercer el derecho de retracto.",
            "Para ejercerlo, el producto debe estar sin usar, sellado y en su empaque original. Los costos de transporte de la devolución corren por cuenta de la clienta.",
          ),
        },
        {
          heading: "Productos que no podemos recibir de vuelta",
          body: lines(
            "Por razones de higiene y salud, no aceptamos devoluciones de productos de cosmética, cuidado personal o perfumería que hayan sido abiertos, usados o cuyo sello de seguridad esté roto.",
            "Esta restricción no aplica cuando el producto llegó defectuoso, incompleto o distinto a lo que pediste.",
          ),
        },
        {
          heading: "Si llegó dañado o equivocado",
          body: lines(
            "Escríbenos dentro de las 48 horas siguientes a la entrega con una foto del producto y del empaque. Reponemos el producto sin costo o devolvemos el 100% del dinero, como prefieras.",
            "También aplica la garantía legal de 6 meses por defectos de fabricación.",
          ),
        },
        {
          heading: "Cómo iniciar el proceso",
          body: lines(
            email && whatsapp
              ? `Escríbenos a ${email} o por WhatsApp al ${whatsapp} con tu número de pedido.`
              : email
                ? `Escríbenos a ${email} con tu número de pedido.`
                : whatsapp
                  ? `Escríbenos por WhatsApp al ${whatsapp} con tu número de pedido.`
                  : "Escríbenos desde la página de contacto con tu número de pedido.",
            "Te respondemos con los pasos exactos y las devoluciones de dinero se hacen por el mismo medio de pago dentro de los 10 días hábiles siguientes a que recibamos el producto.",
          ),
        },
      ],
    },
    {
      slug: "terminos",
      title: "Términos y condiciones",
      intro: `Las reglas del juego al comprar en ${name}.`,
      updated: UPDATED,
      sections: [
        {
          heading: "Quiénes somos",
          body: lines(
            responsible
              ? `${responsible}${city ? `, con domicilio en ${city}` : ""}, opera la tienda ${SITE_URL}. Al usar el sitio y realizar un pedido aceptas estos términos.`
              : `Al usar ${SITE_URL} y realizar un pedido aceptas estos términos.`,
          ),
        },
        {
          heading: "Productos y precios",
          body: lines(
            "Todos los precios están en pesos colombianos (COP) e incluyen IVA cuando aplica.",
            "Hacemos lo posible por mostrar los colores con fidelidad, pero los tonos pueden variar levemente según la pantalla de tu dispositivo.",
            "Los precios y la disponibilidad pueden cambiar sin aviso previo. El precio que aplica es el que ves al momento de confirmar tu pedido.",
          ),
        },
        {
          heading: "Pedidos",
          body: lines(
            "No necesitas crear cuenta. Pedimos nombre, correo, celular, dirección y barrio únicamente para procesar y entregar tu pedido. El correo es obligatorio porque es el canal de confirmación.",
            "Confirmar el pedido no lo hace definitivo: queda en firme cuando confirmamos el pago. Podemos rechazar o cancelar un pedido si detectamos un error de precio evidente o falta de inventario, avisándote y devolviendo cualquier valor pagado.",
          ),
        },
        {
          heading: "Medios de pago",
          body: lines(
            payments.length > 0
              ? `Aceptamos ${payments.join(", ")}. No solicitamos ni almacenamos datos de tarjetas de crédito.`
              : "Te confirmamos los medios de pago disponibles al momento de tomar tu pedido. No solicitamos ni almacenamos datos de tarjetas de crédito.",
          ),
        },
        {
          heading: "Uso del sitio",
          body: lines(
            "El contenido del sitio (textos, ilustraciones, fotografías, logotipo y diseño) es propiedad de la marca y no puede reproducirse comercialmente sin autorización escrita.",
            "Está prohibido usar el sitio para actividades fraudulentas o que afecten su funcionamiento.",
          ),
        },
        {
          heading: "Ley aplicable",
          body: lines(
            `Estos términos se rigen por la legislación colombiana (${COUNTRY_CODE}). Cualquier controversia se resolverá ante las autoridades competentes${city ? ` en ${city}` : ""}.`,
          ),
        },
      ],
    },
    {
      slug: "privacidad",
      title: "Política de privacidad",
      intro:
        "Solo pedimos los datos necesarios para entregarte tu pedido. Nunca los vendemos.",
      updated: UPDATED,
      sections: [
        {
          heading: "Responsable del tratamiento",
          body: lines(
            responsible
              ? `${responsible}${settings.storeAddress ? `, ubicada en ${settings.storeAddress}` : city ? `, en ${city}` : ""}, es responsable del tratamiento de tus datos personales.${email ? ` Puedes contactarnos en ${email}.` : ""}`
              : `Quien opera esta tienda es responsable del tratamiento de tus datos personales.${email ? ` Puedes contactarnos en ${email}.` : ""}`,
          ),
        },
        {
          heading: "Qué datos recogemos",
          body: lines(
            "Al hacer un pedido: nombre, correo electrónico, número de celular, dirección y barrio de entrega, y las notas que escribas.",
            "Al suscribirte a nuestras novedades: nombre (opcional) y correo electrónico.",
            "Al escribirnos: los datos que incluyas en el formulario de contacto.",
            "De forma automática: datos técnicos de navegación anónimos para entender qué páginas se visitan más y mejorar la tienda.",
          ),
        },
        {
          heading: "Para qué los usamos",
          body: lines(
            "Procesar, empacar y entregar tu pedido, y comunicarte su estado.",
            "Responder tus preguntas y atender cambios o devoluciones.",
            "Si te suscribiste, enviarte novedades. Puedes darte de baja con un clic en cualquier correo.",
            "Cumplir obligaciones legales y contables.",
          ),
        },
        {
          heading: "Con quién los compartimos",
          body: lines(
            "Con la empresa de mensajería que lleva tu pedido, únicamente los datos necesarios para la entrega.",
            "Con proveedores tecnológicos que nos ayudan a operar (correo transaccional, alojamiento web), bajo acuerdos de confidencialidad.",
            "No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.",
          ),
        },
        {
          heading: "Tus derechos",
          body: lines(
            "Conforme a la Ley 1581 de 2012, puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización de tratamiento.",
            email
              ? `Para ejercerlos, escríbenos a ${email} indicando tu solicitud. Respondemos en un máximo de quince (15) días hábiles.`
              : "Para ejercerlos, escríbenos desde la página de contacto indicando tu solicitud. Respondemos en un máximo de quince (15) días hábiles.",
          ),
        },
        {
          heading: "Conservación y seguridad",
          body: lines(
            "Conservamos los datos de pedidos por el tiempo que exige la normativa contable y fiscal colombiana. Los datos de suscripción se conservan hasta que pidas darte de baja.",
            "Aplicamos medidas técnicas y organizativas razonables para proteger tu información, incluyendo conexión cifrada (HTTPS) en todo el sitio.",
          ),
        },
        {
          heading: "Cookies",
          body: lines(
            "Usamos almacenamiento local del navegador para recordar tu bolsa de compras, tus favoritos y los productos que pusiste a comparar. Esa información se queda en tu dispositivo y no la enviamos a ningún servidor.",
          ),
        },
      ],
    },
  ];
}

export function legalBySlug(
  settings: SiteSettings,
  slug: string,
): LegalDoc | undefined {
  return legalDocs(settings).find((doc) => doc.slug === slug);
}

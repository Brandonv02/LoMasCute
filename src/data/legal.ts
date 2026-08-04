import { activeZone, site } from "@/config/site";
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
 */
export const legalDocs: LegalDoc[] = [
  {
    slug: "envios",
    title: "Políticas de envío",
    intro: `Hoy entregamos en ${activeZone.label}. Estamos preparando la expansión a todo Colombia.`,
    updated: "1 de agosto de 2026",
    sections: [
      {
        heading: "Cobertura actual",
        body: [
          `Entregamos en ${activeZone.label}: Medellín y los municipios de Envigado, Sabaneta, Itagüí, Bello y La Estrella.`,
          "Si tu dirección queda fuera de esta zona, escríbenos por WhatsApp antes de pedir. En algunos casos podemos coordinar una entrega especial o guardarte el pedido.",
        ],
      },
      {
        heading: "Costo y tiempos",
        body: [
          `El envío cuesta ${formatCOP(activeZone.price)} y es gratis en pedidos superiores a ${formatCOP(activeZone.freeFrom)}.`,
          `El tiempo estimado de entrega es de ${activeZone.eta}. Si haces tu pedido antes de las 3:00 p.m. de un día hábil, lo despachamos el mismo día.`,
          "Los pedidos hechos sábado después de mediodía, domingo o festivo se despachan el siguiente día hábil.",
        ],
      },
      {
        heading: "Confirmación del pago",
        body: [
          "El pedido se despacha una vez confirmamos el pago. Como trabajamos con Nequi y transferencia, te enviamos los datos por correo y WhatsApp inmediatamente después de que confirmas.",
          "Si no recibimos el pago dentro de 24 horas, liberamos el inventario para otras clientas. No te preocupes: te escribimos antes de hacerlo.",
        ],
      },
      {
        heading: "Seguimiento",
        body: [
          "Te avisamos por WhatsApp cuando el pedido sale del taller y te compartimos el número de guía si aplica.",
          "Si nadie puede recibir, coordinamos un segundo intento sin costo adicional. A partir del tercer intento sí debemos cobrar de nuevo el domicilio.",
        ],
      },
      {
        heading: "Empaque",
        body: [
          "Todos los pedidos van en papel de seda con sticker de marca. Si marcaste que es un regalo, sumamos tarjeta escrita a mano y no incluimos la factura dentro de la caja.",
        ],
      },
    ],
  },
  {
    slug: "devoluciones",
    title: "Cambios y devoluciones",
    intro:
      "Queremos que ames lo que pediste. Si algo no salió bien, lo resolvemos.",
    updated: "1 de agosto de 2026",
    sections: [
      {
        heading: "Derecho de retracto",
        body: [
          "Conforme al Estatuto del Consumidor (Ley 1480 de 2011), en compras a distancia tienes cinco (5) días hábiles desde que recibes el pedido para ejercer el derecho de retracto.",
          "Para ejercerlo, el producto debe estar sin usar, sellado y en su empaque original. Los costos de transporte de la devolución corren por cuenta de la clienta.",
        ],
      },
      {
        heading: "Productos que no podemos recibir de vuelta",
        body: [
          "Por razones de higiene y salud, no aceptamos devoluciones de productos de maquillaje, skincare o perfumería que hayan sido abiertos, usados o cuyo sello de seguridad esté roto.",
          "Esta restricción no aplica cuando el producto llegó defectuoso, incompleto o distinto a lo que pediste.",
        ],
      },
      {
        heading: "Si llegó dañado o equivocado",
        body: [
          "Escríbenos dentro de las 48 horas siguientes a la entrega con una foto del producto y del empaque. Reponemos el producto sin costo o devolvemos el 100% del dinero, como prefieras.",
          "También aplica la garantía legal de 6 meses por defectos de fabricación.",
        ],
      },
      {
        heading: "Cambios de tono o producto",
        body: [
          "Si pediste un tono y al abrirlo notas que no es el que querías (sin haberlo usado), podemos cambiarlo dentro de los 5 días. Solo pagas el domicilio del cambio.",
        ],
      },
      {
        heading: "Cómo iniciar el proceso",
        body: [
          `Escríbenos a ${site.contact.email} o por WhatsApp al ${site.contact.whatsappDisplay} con tu número de pedido. Te respondemos con los pasos exactos en menos de un día hábil.`,
          "Las devoluciones de dinero se hacen por el mismo medio de pago dentro de los 10 días hábiles siguientes a que recibamos el producto.",
        ],
      },
    ],
  },
  {
    slug: "terminos",
    title: "Términos y condiciones",
    intro: `Las reglas del juego al comprar en ${site.name}.`,
    updated: "1 de agosto de 2026",
    sections: [
      {
        heading: "Quiénes somos",
        body: [
          `${site.legalName}, con domicilio en ${site.city}, Colombia, opera la tienda ${site.url}. Al usar el sitio y realizar un pedido aceptas estos términos.`,
        ],
      },
      {
        heading: "Productos y precios",
        body: [
          "Todos los precios están en pesos colombianos (COP) e incluyen IVA cuando aplica.",
          "Hacemos lo posible por mostrar los colores con fidelidad, pero los tonos pueden variar levemente según la pantalla de tu dispositivo.",
          "Los precios y la disponibilidad pueden cambiar sin aviso previo. El precio que aplica es el que ves al momento de confirmar tu pedido.",
        ],
      },
      {
        heading: "Pedidos",
        body: [
          "No necesitas crear cuenta. Pedimos nombre, correo, celular, dirección y barrio únicamente para procesar y entregar tu pedido. El correo es obligatorio porque es el canal de confirmación.",
          "Confirmar el pedido no lo hace definitivo: queda en firme cuando confirmamos el pago. Podemos rechazar o cancelar un pedido si detectamos un error de precio evidente o falta de inventario, avisándote y devolviendo cualquier valor pagado.",
        ],
      },
      {
        heading: "Medios de pago",
        body: [
          `Aceptamos ${site.payments.filter((p) => p.active).map((p) => p.label).join(", ")}. No solicitamos ni almacenamos datos de tarjetas de crédito.`,
          "Estamos integrando pasarelas de pago adicionales. Cuando estén activas, se regirán por sus propios términos además de estos.",
        ],
      },
      {
        heading: "Uso del sitio",
        body: [
          "El contenido del sitio (textos, ilustraciones, fotografías, logotipo y diseño) es propiedad de la marca y no puede reproducirse comercialmente sin autorización escrita.",
          "Está prohibido usar el sitio para actividades fraudulentas o que afecten su funcionamiento.",
        ],
      },
      {
        heading: "Ley aplicable",
        body: [
          "Estos términos se rigen por la legislación colombiana. Cualquier controversia se resolverá ante las autoridades competentes en Medellín, Antioquia.",
        ],
      },
    ],
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    intro:
      "Solo pedimos los datos necesarios para entregarte tu pedido. Nunca los vendemos.",
    updated: "1 de agosto de 2026",
    sections: [
      {
        heading: "Responsable del tratamiento",
        body: [
          `${site.legalName}, ubicada en ${site.contact.address}, es responsable del tratamiento de tus datos personales. Puedes contactarnos en ${site.contact.email}.`,
        ],
      },
      {
        heading: "Qué datos recogemos",
        body: [
          "Al hacer un pedido: nombre, correo electrónico, número de celular, dirección y barrio de entrega, y las notas que escribas.",
          "Al suscribirte al Club Cute: nombre (opcional) y correo electrónico.",
          "Al escribirnos: los datos que incluyas en el formulario de contacto.",
          "De forma automática: datos técnicos de navegación anónimos para entender qué páginas se visitan más y mejorar la tienda.",
        ],
      },
      {
        heading: "Para qué los usamos",
        body: [
          "Procesar, empacar y entregar tu pedido, y comunicarte su estado.",
          "Responder tus preguntas y atender cambios o devoluciones.",
          "Si te suscribiste, enviarte novedades y promociones. Puedes darte de baja con un clic en cualquier correo.",
          "Cumplir obligaciones legales y contables.",
        ],
      },
      {
        heading: "Con quién los compartimos",
        body: [
          "Con la empresa de mensajería que lleva tu pedido, únicamente los datos necesarios para la entrega.",
          "Con proveedores tecnológicos que nos ayudan a operar (correo transaccional, alojamiento web), bajo acuerdos de confidencialidad.",
          "No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Conforme a la Ley 1581 de 2012, puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización de tratamiento.",
          `Para ejercerlos, escríbenos a ${site.contact.email} indicando tu solicitud. Respondemos en un máximo de quince (15) días hábiles.`,
        ],
      },
      {
        heading: "Conservación y seguridad",
        body: [
          "Conservamos los datos de pedidos por el tiempo que exige la normativa contable y fiscal colombiana. Los datos de suscripción se conservan hasta que pidas darte de baja.",
          "Aplicamos medidas técnicas y organizativas razonables para proteger tu información, incluyendo conexión cifrada (HTTPS) en todo el sitio.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Usamos almacenamiento local del navegador para recordar tu bolsa de compras, tus favoritos y los productos que pusiste a comparar. Esa información se queda en tu dispositivo y no la enviamos a ningún servidor.",
        ],
      },
    ],
  },
];

export const legalBySlug = (slug: string) =>
  legalDocs.find((doc) => doc.slug === slug);

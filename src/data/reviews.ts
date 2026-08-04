import type { Review } from "@/lib/types";

export const reviews: Review[] = [
  {
    id: "rv-1",
    name: "Valentina M.",
    city: "Laureles, Medellín",
    rating: 5,
    date: "2026-07-18",
    initials: "VM",
    tone: "rose",
    productSlug: "labial-satinado-cloud-kiss",
    text: "Pedí a las 4 de la tarde y me llegó al otro día antes del mediodía. El labial es exactamente el color de la foto y viene envuelto tan lindo que me dio pena abrirlo.",
  },
  {
    id: "rv-2",
    name: "Sara G.",
    city: "Envigado",
    rating: 5,
    date: "2026-07-11",
    initials: "SG",
    tone: "mint",
    productSlug: "serum-calmante-petal-water",
    text: "Tengo piel reactiva y llevaba meses buscando algo que no me ardiera. Este serum me bajó las rojeces de las mejillas en como cinco días. Ya voy por el segundo frasco.",
  },
  {
    id: "rv-3",
    name: "Camila R.",
    city: "El Poblado, Medellín",
    rating: 5,
    date: "2026-06-29",
    initials: "CR",
    tone: "lavender",
    productSlug: "kit-regalo-cute-box",
    text: "Se lo regalé a mi mejor amiga por su cumpleaños y lloró con la tarjeta escrita a mano. La caja es hermosa, la reutilizó para guardar sus cosas.",
  },
  {
    id: "rv-4",
    name: "Daniela P.",
    city: "Sabaneta",
    rating: 4,
    date: "2026-06-20",
    initials: "DP",
    tone: "peach",
    productSlug: "paleta-sombras-pastel-diary",
    text: "La paleta es divina y los mates se difuminan solitos. Le doy 4 porque quisiera que trajeran un tono más oscuro, pero los pastel son un sueño.",
  },
  {
    id: "rv-5",
    name: "Mariana T.",
    city: "Belén, Medellín",
    rating: 5,
    date: "2026-06-08",
    initials: "MT",
    tone: "gold",
    productSlug: "perfume-vanilla-cloud",
    text: "Huele a vainilla pero elegante, no a bebé. Me han preguntado tres veces qué perfume uso y ya lo compraron dos compañeras de trabajo.",
  },
  {
    id: "rv-6",
    name: "Laura V.",
    city: "Itagüí",
    rating: 5,
    date: "2026-05-30",
    initials: "LV",
    tone: "rose",
    productSlug: "cosmetiquera-puffy-pouch",
    text: "La cosmetiquera es más grande de lo que pensé y se para sola. Me cabe toda la rutina de skincare para viajar. Muy buena calidad para el precio.",
  },
  {
    id: "rv-7",
    name: "Juliana A.",
    city: "Bello",
    rating: 5,
    date: "2026-05-22",
    initials: "JA",
    tone: "mint",
    productSlug: "bruma-fijadora-dewy-mist",
    text: "Con el calor de aquí, esta bruma me salva. La llevo en la cartera y me la echo a mediodía. El maquillaje no se me mueve y la cara queda fresquita.",
  },
  {
    id: "rv-8",
    name: "Isabella C.",
    city: "Estadio, Medellín",
    rating: 5,
    date: "2026-05-14",
    initials: "IC",
    tone: "lavender",
    productSlug: "set-brochas-cloud-brush",
    text: "Las brochas son suavísimas y no botan pelo, ya las lavé como seis veces y siguen iguales. El estuche viene muy bien pensado.",
  },
  {
    id: "rv-9",
    name: "Andrea L.",
    city: "La América, Medellín",
    rating: 5,
    date: "2026-05-02",
    initials: "AL",
    tone: "peach",
    productSlug: "balsamo-labial-baby-balm",
    text: "Me lo pongo antes de dormir y amanezco con los labios lisos. Lo compré tres veces ya, uno para la casa, uno para el bolso y uno para mi mamá.",
  },
];

export const reviewsForProduct = (slug: string) =>
  reviews.filter((r) => r.productSlug === slug);

export const ratingSummary = {
  average:
    Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10,
  count: 1284,
};

/** Preguntas frecuentes generales de la tienda */
export const storeFaqs = [
  {
    q: "¿A dónde hacen envíos?",
    a: "Hoy entregamos en Medellín y el Área Metropolitana (Envigado, Sabaneta, Itagüí, Bello y La Estrella) en 24 a 48 horas hábiles. Estamos preparando los envíos a todo Colombia, así que déjanos tu correo para avisarte primero.",
  },
  {
    q: "¿Cuánto cuesta el envío?",
    a: "$8.900 en Medellín y el Área Metropolitana. Si tu pedido supera $120.000, el envío va por nuestra cuenta.",
  },
  {
    q: "¿Necesito crear una cuenta para comprar?",
    a: "No. Solo pedimos nombre, correo, celular y dirección. El correo es obligatorio porque ahí te llega la confirmación de tu pedido.",
  },
  {
    q: "¿Cómo puedo pagar?",
    a: "Nequi, transferencia Bancolombia u otra transferencia bancaria (Davivienda, Nu, Lulo, Daviplata). Al confirmar el pedido te enviamos los datos exactos por correo y WhatsApp. Muy pronto sumamos pago con tarjeta.",
  },
  {
    q: "¿Los productos son originales?",
    a: "Sí. Trabajamos directamente con las marcas o con sus distribuidores autorizados en Colombia, y todo llega sellado con su registro Invima cuando aplica.",
  },
  {
    q: "¿Puedo cambiar o devolver algo?",
    a: "Tienes 5 días desde que recibes el pedido. Por higiene no podemos recibir de vuelta productos abiertos o usados, salvo que llegaran defectuosos: en ese caso lo reponemos sin costo.",
  },
  {
    q: "¿Hacen regalos con envoltura?",
    a: "Siempre. Todos los pedidos van con papel de seda y sticker de marca. Si es un regalo, cuéntanoslo en las notas y le sumamos tarjeta escrita a mano sin costo.",
  },
];

/** Razones para comprar aquí — sección "¿Por qué comprar aquí?" */
export const reasons = [
  {
    icon: "truck",
    title: "Llega en 24 a 48 horas",
    text: "Despachamos el mismo día si pides antes de las 3 p.m. Entregamos en toda Medellín y el Área Metropolitana.",
    tone: "rose" as const,
  },
  {
    icon: "gift",
    title: "Todo llega envuelto",
    text: "Papel de seda, sticker de marca y una notica escrita a mano. Sin costo adicional, siempre.",
    tone: "peach" as const,
  },
  {
    icon: "shield",
    title: "Productos originales",
    text: "Directo de marcas y distribuidores autorizados. Sellados, con registro Invima cuando aplica.",
    tone: "mint" as const,
  },
  {
    icon: "heart",
    title: "Curaduría de verdad",
    text: "Probamos todo antes de venderlo. Si no nos gusta, no entra a la tienda.",
    tone: "lavender" as const,
  },
  {
    icon: "message",
    title: "Te respondemos rápido",
    text: "Escríbenos por WhatsApp y te contesta una persona real, normalmente en minutos.",
    tone: "gold" as const,
  },
  {
    icon: "wallet",
    title: "Paga como te quede fácil",
    text: "Nequi, Bancolombia o transferencia. Sin registro, sin datos de tarjeta, sin complicaciones.",
    tone: "rose" as const,
  },
];

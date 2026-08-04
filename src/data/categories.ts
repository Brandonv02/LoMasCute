import type { Category } from "@/lib/types";

/**
 * Las seis categorías nacen abiertas: la identidad no depende del maquillaje.
 * Hoy tres están surtidas y el resto llega pronto — la estructura ya existe,
 * así que ampliar el catálogo no obliga a rediseñar nada.
 */
export const categories: Category[] = [
  {
    slug: "maquillaje",
    name: "Maquillaje",
    claim: "Tu cara lavada, pero mejor",
    description:
      "Labiales, rubores, sombras y bases con acabados suaves y naturales. Fórmulas livianas, tonos que combinan con todo y empaques que dan gusto sacar del bolso.",
    image: "/art/categoria-maquillaje.svg",
    tone: "rose",
    subcategories: ["Labios", "Rostro", "Ojos", "Fijadores"],
  },
  {
    slug: "skincare",
    name: "Skincare",
    claim: "Rutina cortita, piel feliz",
    description:
      "Lo esencial para una rutina de tres pasos: limpiar, hidratar y proteger. Sin ingredientes agresivos ni promesas imposibles.",
    image: "/art/categoria-skincare.svg",
    tone: "mint",
    subcategories: ["Hidratación", "Serums", "Labios", "Cuerpo"],
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    claim: "Los detalles que te alegran",
    description:
      "Brochas suavísimas, espejos de bolsillo, cosmetiqueras acolchadas y todo lo que hace que arreglarse sea un ritual bonito.",
    image: "/art/categoria-accesorios.svg",
    tone: "lavender",
    subcategories: ["Brochas", "Organización", "Cabello", "Espejos"],
  },
  {
    slug: "perfumes",
    name: "Perfumes",
    claim: "Oler a nube de vainilla",
    description:
      "Brumas y perfumes ligeros, dulces sin empalagar. Para llevar en la cartera y reaplicar cuando quieras sentirte nueva.",
    image: "/art/categoria-perfumes.svg",
    tone: "gold",
    subcategories: ["Brumas", "Eau de parfum", "Corporales"],
  },
  {
    slug: "papeleria",
    name: "Papelería",
    claim: "Escribir bonito da felicidad",
    description:
      "Cuadernos, stickers, agendas y lapiceros para que tus listas, tus clases y tus planes se vean tan lindos como se sienten.",
    image: "/art/categoria-papeleria.svg",
    tone: "lavender",
    comingSoon: true,
    subcategories: ["Cuadernos", "Stickers", "Agendas", "Escritura"],
  },
  {
    slug: "regalos",
    name: "Regalos",
    claim: "Envuelto y listo para dar",
    description:
      "Kits armados, cajas sorpresa y envolturas hechas a mano. Le pones la tarjeta y nosotras el resto.",
    image: "/art/categoria-regalos.svg",
    tone: "peach",
    subcategories: ["Kits", "Cajas", "Tarjetas", "Para consentir"],
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

/** Vitrina de crecimiento: lo que la marca ya sabe que quiere vender */
export const comingCategories = [
  { name: "Decoración", icon: "🕯️" },
  { name: "Tazas y termos", icon: "🧸" },
  { name: "Joyería suave", icon: "🎀" },
  { name: "Ropa de casa", icon: "🌙" },
];

export type CategorySlug =
  | "maquillaje"
  | "skincare"
  | "accesorios"
  | "perfumes"
  | "papeleria"
  | "regalos";

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Frase corta que aparece en la card */
  claim: string;
  description: string;
  image: string;
  /** Acento pastel del sistema de color */
  tone: "rose" | "mint" | "lavender" | "peach" | "gold";
  /** Categorías "muy pronto" se muestran pero no son navegables como tienda */
  comingSoon?: boolean;
  subcategories: string[];
};

export type Shade = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Nombre corto del tono/edición, va debajo del nombre */
  tagline: string;
  category: CategorySlug;
  subcategory: string;
  price: number;
  /** Precio antes del descuento */
  compareAtPrice?: number;
  images: string[];
  shades?: Shade[];
  rating: number;
  reviewsCount: number;
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFavorite?: boolean;
  description: string;
  highlights: string[];
  ingredients: string;
  howTo: string[];
  faqs?: { q: string; a: string }[];
  /** Etiquetas para la búsqueda inteligente */
  tags: string[];
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  shade?: string;
  quantity: number;
  stock: number;
};

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  text: string;
  productSlug?: string;
  /** Inicial(es) para el avatar generado */
  initials: string;
  tone: "rose" | "mint" | "lavender" | "peach" | "gold";
};

/**
 * El slug de una categoría es un dato, no una lista cerrada en el código.
 *
 * Antes era una unión de seis literales, así que abrir una categoría obligaba a
 * editar este archivo y desplegar. La estructura del catálogo vive entera en la
 * base (ver 0010_catalog_taxonomy.sql) y se administra desde el panel.
 */
export type CategorySlug = string;

/** Segundo nivel del catálogo. Solo llegan aquí las activas. */
export type Subcategory = {
  slug: string;
  name: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  /** Frase corta que aparece en la card */
  claim: string;
  description: string;
  image: string;
  /** Acento pastel del sistema de color */
  tone: "rose" | "mint" | "lavender" | "peach" | "gold";
  /** Nombre de icono de lucide, opcional */
  icon?: string;
  /** Categorías "muy pronto" se muestran pero no son navegables como tienda */
  comingSoon?: boolean;
  /** Título y descripción para buscadores; vacíos, se usan nombre y descripción */
  seoTitle?: string;
  seoDescription?: string;
  subcategories: Subcategory[];
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
  /** Nombre de la subcategoría, para mostrar. Vacío si no tiene. */
  subcategory: string;
  /** Slug de la subcategoría, para filtrar. Vacío si no tiene. */
  subcategorySlug: string;
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

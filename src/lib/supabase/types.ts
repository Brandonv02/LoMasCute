/**
 * Tipado del esquema de Supabase.
 *
 * Escrito a mano y sincronizado con `supabase/migrations/`. Cuando el proyecto
 * esté creado se puede regenerar con:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 *
 * Mientras tanto esto da el mismo autocompletado y los mismos errores de
 * compilación, sin obligar a tener la CLI configurada para poder construir.
 */

export type ProductStatus = "draft" | "published" | "archived";
export type BrandTone = "rose" | "mint" | "lavender" | "peach" | "gold";

export const PRODUCT_STATUSES: ProductStatus[] = ["draft", "published", "archived"];

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  image_url: string | null;
  tone: BrandTone;
  position: number;
  is_active: boolean;
  coming_soon: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  subcategory: string | null;
  /** Entero en la unidad mínima de `currency`. COP no usa decimales. */
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock: number;
  status: ProductStatus;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
};

type Insertable<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>;

/** Columnas que la base rellena sola */
type Generated = "id" | "created_at" | "updated_at";

/**
 * La forma la impone `@supabase/postgrest-js`: cada tabla necesita
 * `Relationships` y el esquema necesita `Views` y `Functions`, aunque estén
 * vacíos. Sin ellos todo el cliente colapsa a `never` y se pierde el tipado.
 */
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Insertable<
          CategoryRow,
          Generated | "claim" | "description" | "image_url" | "tone" | "position" | "is_active" | "coming_soon"
        >;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Insertable<
          ProductRow,
          | Generated
          | "tagline"
          | "description"
          | "category_id"
          | "subcategory"
          | "compare_at_price"
          | "currency"
          | "stock"
          | "status"
          | "is_featured"
          | "rating"
          | "reviews_count"
          | "published_at"
        >;
        Update: Partial<ProductRow>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: Insertable<
          ProductImageRow,
          Generated | "alt" | "position" | "is_primary" | "width" | "height"
        >;
        Update: Partial<ProductImageRow>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      product_status: ProductStatus;
      brand_tone: BrandTone;
    };
    CompositeTypes: Record<never, never>;
  };
};

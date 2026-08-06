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

/** Lo que cabe en una columna `jsonb`. */
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export const PRODUCT_STATUSES: ProductStatus[] = ["draft", "published", "archived"];

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  claim: string | null;
  description: string | null;
  image_url: string | null;
  tone: BrandTone;
  /** Nombre de icono de lucide (ver 0010_catalog_taxonomy.sql) */
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  position: number;
  is_active: boolean;
  coming_soon: boolean;
  created_at: string;
  updated_at: string;
};

/** Segundo nivel del catálogo, hijo de `categories`. */
export type SubcategoryRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  position: number;
  is_active: boolean;
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
  subcategory_id: string | null;
  /** Copia del nombre de la subcategoría; la mantiene un disparador. */
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

/**
 * Ajustes de la tienda en pares clave/valor (ver 0005_site_settings.sql).
 * El valor es `jsonb` para poder guardar tanto un texto como una lista sin
 * cambiar el esquema cada vez que aparece un ajuste nuevo.
 */
export type SiteSettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

/* ------------------------------------------------------------------ ventas */

export type OrderStatus = "pendiente" | "pagado" | "entregado" | "cancelado";

export type PaymentMethod =
  | "efectivo"
  | "nequi"
  | "bancolombia"
  | "transferencia"
  | "otro";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendiente",
  "pagado",
  "entregado",
  "cancelado",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "efectivo",
  "nequi",
  "bancolombia",
  "transferencia",
  "otro",
];

export type OrderRow = {
  id: string;
  /** Código legible: LMC-0001 */
  code: string;
  customer_name: string | null;
  customer_whatsapp: string | null;
  customer_city: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  notes: string | null;
  /** Entero en pesos. Lo calcula la base, no la aplicación. */
  total: number;
  /**
   * `true` cuando el stock de la venta ya volvió al catálogo (ver
   * 0007_orders_cancel_stock.sql). Lo mantiene un disparador al cambiar de
   * estado: la aplicación no lo escribe nunca.
   */
  stock_returned: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  /** Copia del nombre al vender: no sigue al catálogo */
  product_name: string;
  unit_price: number;
  quantity: number;
  /** Columna generada: unit_price × quantity */
  subtotal: number;
  created_at: string;
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
          | Generated
          | "claim"
          | "description"
          | "image_url"
          | "tone"
          | "icon"
          | "seo_title"
          | "seo_description"
          | "position"
          | "is_active"
          | "coming_soon"
        >;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      subcategories: {
        Row: SubcategoryRow;
        Insert: Insertable<SubcategoryRow, Generated | "position" | "is_active">;
        Update: Partial<SubcategoryRow>;
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: ProductRow;
        Insert: Insertable<
          ProductRow,
          | Generated
          | "tagline"
          | "description"
          | "category_id"
          | "subcategory_id"
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
          {
            foreignKeyName: "products_subcategory_id_fkey";
            columns: ["subcategory_id"];
            isOneToOne: false;
            referencedRelation: "subcategories";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: Insertable<SiteSettingRow, "updated_at">;
        Update: Partial<SiteSettingRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Insertable<
          OrderRow,
          | Generated
          | "code"
          | "customer_name"
          | "customer_whatsapp"
          | "customer_city"
          | "payment_method"
          | "status"
          | "notes"
          | "total"
          | "stock_returned"
        >;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        // `subtotal` es una columna generada: la base la calcula sola. Esta
        // tabla no lleva `updated_at`, así que no usa `Generated`.
        Insert: Insertable<
          OrderItemRow,
          "id" | "created_at" | "subtotal" | "product_id"
        >;
        Update: Partial<OrderItemRow>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
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
    Functions: {
      /** Crea la venta, su detalle y descuenta stock en una sola transacción. */
      create_manual_order: {
        Args: { payload: Json };
        Returns: string;
      };
      /** Borra la venta y devuelve su stock al catálogo. */
      delete_order: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      product_status: ProductStatus;
      brand_tone: BrandTone;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<never, never>;
  };
};

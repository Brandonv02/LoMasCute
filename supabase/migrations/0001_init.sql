-- ============================================================
-- Lo Más Cute — esquema base del catálogo
-- 0001_init: categorías, productos e imágenes de producto
-- ============================================================
--
-- Decisiones pensando en que la tienda crezca:
--
--  · Claves uuid, no seriales. Permiten generar el id antes de insertar
--    (útil para subir imágenes a Storage antes de guardar el producto) y
--    no filtran cuántos productos hay.
--  · El precio se guarda como entero en la unidad mínima de la moneda.
--    El peso colombiano no usa decimales, así que 48900 son $ 48.900; la
--    columna `currency` deja la puerta abierta a otra moneda sin migrar
--    datos ni arriesgar redondeos de coma flotante.
--  · `status` es un enum, no un booleano: "borrador" y "archivado" son
--    estados distintos de "no publicado" y hacen falta desde el día uno.
--  · Búsqueda por columna generada + índice GIN. Un `ilike '%…%'` deja de
--    servir a las pocas miles de referencias.
--  · Cada tabla lleva `updated_at` mantenido por trigger, no por la
--    aplicación: así ninguna ruta de escritura puede olvidarse.

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ------------------------------------------------------------------ enums

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('draft', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'brand_tone') then
    -- Los acentos pastel del sistema de diseño. Vive en la base para que el
    -- panel no pueda guardar un tono que la tienda no sabe pintar.
    create type public.brand_tone as enum ('rose', 'mint', 'lavender', 'peach', 'gold');
  end if;
end $$;

-- ------------------------------------------------------- utilidad: updated_at

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------- categorías

create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  claim         text,
  description   text,
  image_url     text,
  tone          public.brand_tone not null default 'rose',
  -- Orden manual en la vitrina. Con hueco entre valores para poder
  -- intercalar sin renumerar toda la tabla.
  position      integer not null default 0,
  is_active     boolean not null default true,
  coming_soon   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists categories_position_idx on public.categories (position, name);
create index if not exists categories_active_idx on public.categories (is_active) where is_active;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

comment on table public.categories is 'Categorías del catálogo. `coming_soon` las muestra en la tienda sin ser navegables.';

-- --------------------------------------------------------------- productos

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  tagline           text,
  description       text,

  category_id       uuid references public.categories (id) on delete set null,
  subcategory       text,

  -- Enteros en la unidad mínima de `currency`. Nunca coma flotante.
  price             integer not null,
  compare_at_price  integer,
  currency          char(3) not null default 'COP',

  stock             integer not null default 0,
  status            public.product_status not null default 'draft',
  is_featured       boolean not null default false,

  -- Se alimentan de las reseñas cuando existan; por ahora son informativos.
  rating            numeric(2,1) not null default 0,
  reviews_count     integer not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz,

  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint products_price_positive check (price >= 0),
  constraint products_stock_positive check (stock >= 0),
  constraint products_rating_range check (rating >= 0 and rating <= 5),
  -- Un precio anterior que no sea mayor no es un descuento: es un error.
  constraint products_compare_at_higher
    check (compare_at_price is null or compare_at_price > price)
);

-- Búsqueda sin acentos: "balsamo" encuentra "Bálsamo".
--
-- `unaccent()` está declarada STABLE porque depende del diccionario, y una
-- columna generada exige IMMUTABLE. Envolverla en una función propia marcada
-- IMMUTABLE es el rodeo habitual; el diccionario no cambia en la práctica.
--
-- El `search_path` va fijado a propósito: Supabase instala las extensiones en
-- el esquema `extensions` y un Postgres normal las deja en `public`. Fijarlo
-- cubre los dos casos y hace la función inmune a que alguien cambie el
-- search_path de la sesión.
create or replace function public.products_search_document(
  name text, tagline text, description text, subcategory text
)
returns tsvector
language sql
immutable
set search_path = public, extensions, pg_catalog
as $$
  select
    setweight(to_tsvector('simple', unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(tagline, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(subcategory, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'C');
$$;

alter table public.products
  drop column if exists search_document;

alter table public.products
  add column search_document tsvector
  generated always as (
    public.products_search_document(name, tagline, description, subcategory)
  ) stored;

create index if not exists products_search_idx on public.products using gin (search_document);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_created_idx on public.products (created_at desc);
-- El listado de tienda siempre filtra por publicados: índice parcial.
create index if not exists products_published_idx
  on public.products (created_at desc) where status = 'published';
-- El panel consulta "por reponer" a diario.
create index if not exists products_low_stock_idx
  on public.products (stock) where stock <= 12;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- `published_at` se sella la primera vez que el producto sale a la luz y no
-- se vuelve a tocar: es la fecha de lanzamiento, no la de la última edición.
create or replace function public.stamp_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists products_stamp_published_at on public.products;
create trigger products_stamp_published_at
  before insert or update of status on public.products
  for each row execute function public.stamp_published_at();

comment on column public.products.price is 'Entero en la unidad mínima de `currency`. COP no usa decimales: 48900 = $ 48.900.';

-- ------------------------------------------------------ imágenes de producto

-- Tabla aparte desde el principio: un producto tiene varias vistas y el orden
-- importa. Guardamos la ruta dentro del bucket, no la URL completa, para poder
-- cambiar de dominio o de proveedor sin reescribir filas.
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  storage_path  text not null,
  alt           text,
  position      integer not null default 0,
  is_primary    boolean not null default false,
  width         integer,
  height        integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint product_images_position_positive check (position >= 0)
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- Como mucho una imagen principal por producto.
create unique index if not exists product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;

-- El mismo archivo no puede colgar dos veces del mismo producto.
create unique index if not exists product_images_unique_path_idx
  on public.product_images (product_id, storage_path);

drop trigger if exists product_images_set_updated_at on public.product_images;
create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

comment on table public.product_images is 'Rutas dentro del bucket Storage "products". La subida se implementa en una fase posterior.';

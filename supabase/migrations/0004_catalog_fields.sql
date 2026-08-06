-- ============================================================
-- Lo Más Cute — campos de ficha de producto
-- 0004: lo que la tienda pública necesita para pintar la ficha completa
-- ============================================================
--
-- El esquema inicial cubría lo que administra el panel. La tienda muestra
-- bastante más: los tonos disponibles, los puntos fuertes, los ingredientes,
-- el modo de uso y las preguntas frecuentes de cada producto. Mientras esos
-- datos vivían en `src/data/products.ts` no hacían falta aquí; para desconectar
-- el catálogo estático, sí.
--
-- Criterio de tipos:
--
--  · Listas de texto plano (`highlights`, `how_to`, `tags`) → text[]. Son
--    listas ordenadas de cadenas y nada más; jsonb sería pedantería.
--  · Listas de objetos (`shades`, `faqs`) → jsonb. Tienen forma propia y esa
--    forma va a crecer (un tono acabará teniendo stock, un SKU…).
--
-- Los tres booleanos de portada son columnas distintas a propósito: "más
-- vendido", "recién llegado" y "favorito" alimentan tres carruseles distintos
-- de la home y un producto puede estar en varios a la vez.

alter table public.products
  add column if not exists shades      jsonb   not null default '[]'::jsonb,
  add column if not exists highlights  text[]  not null default '{}',
  add column if not exists ingredients text,
  add column if not exists how_to      text[]  not null default '{}',
  add column if not exists faqs        jsonb   not null default '[]'::jsonb,
  add column if not exists tags        text[]  not null default '{}',
  add column if not exists is_new      boolean not null default false,
  add column if not exists is_favorite boolean not null default false;

comment on column public.products.shades is 'Array de {name, hex}. Los tonos que se ven como círculos en la card.';
comment on column public.products.faqs is 'Array de {q, a} específicas del producto.';
comment on column public.products.is_new is 'Carrusel "Recién llegado" de la portada.';
comment on column public.products.is_favorite is 'Carrusel "Los favoritos" de la portada.';

-- El panel marca "Destacado" con `is_featured`; en la tienda eso es el
-- carrusel de más vendidos.
comment on column public.products.is_featured is 'Carrusel "Los más amados" de la portada.';

-- Índices para los tres carruseles: son consultas de portada, las más vistas.
create index if not exists products_featured_idx
  on public.products (created_at desc) where is_featured and status = 'published';
create index if not exists products_new_idx
  on public.products (created_at desc) where is_new and status = 'published';
create index if not exists products_favorite_idx
  on public.products (created_at desc) where is_favorite and status = 'published';

-- Buscar por etiqueta ("regalo", "vegano") sin pasar por el buscador de texto.
create index if not exists products_tags_idx on public.products using gin (tags);

-- ------------------------------------------------- búsqueda con etiquetas

-- La columna generada tiene que recrearse para cambiar su expresión: Postgres
-- no permite alterarla en sitio.
alter table public.products drop column if exists search_document;

create or replace function public.products_search_document(
  name text, tagline text, description text, subcategory text, tags text[]
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
    setweight(to_tsvector('simple', unaccent(array_to_string(coalesce(tags, '{}'), ' '))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'C');
$$;

-- La versión de cuatro argumentos queda huérfana.
drop function if exists public.products_search_document(text, text, text, text);

alter table public.products
  add column search_document tsvector
  generated always as (
    public.products_search_document(name, tagline, description, subcategory, tags)
  ) stored;

create index if not exists products_search_idx on public.products using gin (search_document);

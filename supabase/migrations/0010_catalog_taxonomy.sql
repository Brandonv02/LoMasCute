-- ============================================================
-- Lo Más Cute — Taxonomía del catálogo administrable
-- 0010_catalog_taxonomy: subcategorías, SEO e icono por categoría
-- ============================================================
--
-- Antes de esta migración la estructura del catálogo estaba a medias en la base
-- y a medias en el código: las categorías vivían en `categories`, pero su slug
-- tenía que existir además en un tipo de TypeScript, y la "subcategoría" de un
-- producto era texto libre en `products.subcategory`. Crear una categoría o una
-- subcategoría nueva obligaba a tocar código y a desplegar.
--
-- Aquí se cierra eso:
--
--  · `subcategories` es una tabla propia, hija de `categories`, con su slug, su
--    orden y su estado. Ilimitadas por categoría.
--  · `products.subcategory_id` apunta a ella y es opcional: un producto puede
--    estar solo en su categoría.
--  · `products.subcategory` (texto) se conserva, pero deja de ser un dato que
--    alguien escribe: un disparador lo mantiene igual al nombre de la
--    subcategoría enlazada. Sigue existiendo porque de él se alimenta la
--    columna generada `search_document`, que es la que hace la búsqueda sin
--    acentos; así no hay que reconstruir el índice de búsqueda.
--  · Las categorías ganan `icon`, `seo_title` y `seo_description`.
--
-- La migración de los datos actuales es automática: cada texto distinto de
-- `products.subcategory` se convierte en una fila de `subcategories` de su
-- categoría y los productos quedan enlazados. Es idempotente.

-- ------------------------------------------------------------- utilidades

-- Slug desde un nombre: "Labios & Gloss" -> "labios-gloss". IMMUTABLE para
-- poder usarla en índices y columnas generadas si algún día hace falta. El
-- `search_path` va fijado por el mismo motivo que en `products_search_document`
-- (0001): Supabase instala `unaccent` en `extensions` y un Postgres normal en
-- `public`.
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = public, extensions, pg_catalog
as $$
  select trim(
    both '-' from regexp_replace(
      lower(unaccent(coalesce(value, ''))),
      '[^a-z0-9]+', '-', 'g'
    )
  )
$$;

comment on function public.slugify(text) is
  'Nombre legible → slug. La usan la migración de subcategorías y el panel.';

-- --------------------------------------------------- categorías: SEO e icono

alter table public.categories
  add column if not exists icon            text,
  add column if not exists seo_title       text,
  add column if not exists seo_description text;

comment on column public.categories.icon is
  'Nombre del icono de lucide (ej. "sparkles"). Opcional: sin icono la tienda usa solo el color.';
comment on column public.categories.seo_title is
  'Título para buscadores. Vacío: la tienda usa el nombre de la categoría.';
comment on column public.categories.seo_description is
  'Meta descripción. Vacía: la tienda usa la descripción de la categoría.';

-- ------------------------------------------------------------ subcategorías

create table if not exists public.subcategories (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete cascade,
  slug         text not null,
  name         text not null,
  -- Orden manual dentro de su categoría, con hueco entre valores para poder
  -- intercalar sin renumerar (misma convención que `categories.position`).
  position     integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint subcategories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- El slug solo tiene que ser único dentro de su categoría: "labios" puede
  -- existir en Maquillaje y en Regalos sin chocar.
  constraint subcategories_slug_unique unique (category_id, slug)
);

create index if not exists subcategories_category_idx
  on public.subcategories (category_id, position, name);
create index if not exists subcategories_active_idx
  on public.subcategories (is_active) where is_active;

drop trigger if exists subcategories_set_updated_at on public.subcategories;
create trigger subcategories_set_updated_at
  before update on public.subcategories
  for each row execute function public.set_updated_at();

comment on table public.subcategories is
  'Segundo nivel del catálogo. Ilimitadas por categoría; se administran desde /admin/categorias.';

-- ------------------------------------------------- productos: enlace opcional

alter table public.products
  add column if not exists subcategory_id uuid
    references public.subcategories (id) on delete set null;

create index if not exists products_subcategory_idx
  on public.products (subcategory_id);

comment on column public.products.subcategory_id is
  'Subcategoría opcional. Fuente de verdad; `subcategory` es su nombre denormalizado.';
comment on column public.products.subcategory is
  'Copia del nombre de la subcategoría, mantenida por disparador. Alimenta search_document; no se escribe a mano.';

-- ------------------------------------------ migración de los datos actuales

-- 1. Cada texto distinto de `subcategory` pasa a ser una subcategoría de su
--    categoría, respetando el orden alfabético y dejando huecos de 10.
insert into public.subcategories (category_id, slug, name, position)
select
  origen.category_id,
  public.slugify(origen.subcategory),
  origen.subcategory,
  row_number() over (
    partition by origen.category_id order by lower(origen.subcategory)
  ) * 10
from (
  select distinct
    p.category_id,
    trim(p.subcategory) as subcategory
  from public.products p
  where p.category_id is not null
    and coalesce(trim(p.subcategory), '') <> ''
    and public.slugify(p.subcategory) <> ''
) as origen
on conflict (category_id, slug) do nothing;

-- 2. Los productos quedan enlazados a la subcategoría que les corresponde.
update public.products p
set subcategory_id = s.id
from public.subcategories s
where p.subcategory_id is null
  and p.category_id = s.category_id
  and public.slugify(p.subcategory) = s.slug;

-- ---------------------------------------- sincronía del nombre denormalizado

-- El texto sigue al enlace, no al contrario: así la búsqueda sin acentos
-- (columna generada `search_document`) siempre encuentra el nombre vigente.
create or replace function public.products_sync_subcategory()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.subcategory_id is null then
    new.subcategory := null;
  else
    select s.name into new.subcategory
    from public.subcategories s
    where s.id = new.subcategory_id;
  end if;
  return new;
end;
$$;

drop trigger if exists products_sync_subcategory on public.products;
create trigger products_sync_subcategory
  before insert or update of subcategory_id on public.products
  for each row execute function public.products_sync_subcategory();

-- Y si alguien renombra la subcategoría, sus productos se actualizan.
create or replace function public.subcategories_propagate_name()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.name is distinct from old.name then
    update public.products
    set subcategory = new.name
    where subcategory_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists subcategories_propagate_name on public.subcategories;
create trigger subcategories_propagate_name
  after update of name on public.subcategories
  for each row execute function public.subcategories_propagate_name();

-- ------------------------------------------------------------ privilegios

-- Misma regla que en 0002_rls: la tabla nace con escritura concedida a `anon` y
-- `authenticated`; se la quitamos y devolvemos solo la lectura. El panel
-- escribe con `service_role` desde el servidor.

alter table public.subcategories enable row level security;

revoke all on table public.subcategories from anon, authenticated;
grant select on table public.subcategories to anon, authenticated;
grant all privileges on table public.subcategories to service_role;

-- La tienda solo puede ver las activas, igual que con las categorías. Que una
-- subcategoría desactivada no aparezca no depende de que el código se acuerde
-- de filtrarla.
drop policy if exists "subcategorias activas visibles" on public.subcategories;
create policy "subcategorias activas visibles"
  on public.subcategories
  for select
  to anon, authenticated
  using (is_active);

-- ------------------------------------------------------------ comprobación
--
--   select c.name as categoria, s.name as subcategoria, s.position, s.is_active,
--          count(p.id) as productos
--   from public.categories c
--   left join public.subcategories s on s.category_id = c.id
--   left join public.products p on p.subcategory_id = s.id
--   group by 1, 2, 3, 4
--   order by c.name, s.position;
--
-- Deben aparecer las subcategorías creadas a partir del texto que ya tenían los
-- productos, cada una con sus productos enlazados.

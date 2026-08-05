-- ============================================================
-- Lo Más Cute — Row Level Security
-- 0002_rls: lo mínimo necesario, ni una política de más
-- ============================================================
--
-- Regla de oro de este proyecto: **todo lo que entra por la red pública es
-- de solo lectura, y solo ve lo que está publicado.**
--
-- Se cierra en dos capas, y las dos hacen falta:
--
--  1. PRIVILEGIOS (GRANT/REVOKE): decide si el rol puede *ejecutar* la
--     operación sobre la tabla.
--  2. RLS (POLICY): decide *qué filas* alcanza esa operación.
--
-- Solo con RLS ya no se puede escribir, pero la denegación es silenciosa: un
-- UPDATE o un DELETE sin política encuentra cero filas y devuelve 204 sin
-- error, así que desde el cliente no se distingue de "escribí y no cambió
-- nada". Revocando además el privilegio, el intento falla con un
-- `42501 permission denied`, que es lo que uno espera poder auditar.
--
-- `service_role` no se ve afectado: tiene el atributo BYPASSRLS y aquí se le
-- reafirma el GRANT completo. Es la clave que usa el panel desde el servidor.
--
-- Cuando exista autenticación, el cambio es volver a conceder escritura a
-- `authenticated` y añadir sus políticas con comprobación de rol. Este archivo
-- es el único sitio que habría que tocar.

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;

-- ------------------------------------------------------ capa 1: privilegios

-- Supabase concede por defecto insert/update/delete a `anon` y
-- `authenticated` sobre las tablas nuevas del esquema público. Aquí se lo
-- quitamos y devolvemos únicamente la lectura.
--
-- Nota para el futuro: esto aplica a estas tres tablas. Cualquier tabla que se
-- cree más adelante nace otra vez con los permisos por defecto y necesita el
-- mismo tratamiento.

revoke all on table public.categories     from anon, authenticated;
revoke all on table public.products       from anon, authenticated;
revoke all on table public.product_images from anon, authenticated;

grant select on table public.categories     to anon, authenticated;
grant select on table public.products       to anon, authenticated;
grant select on table public.product_images to anon, authenticated;

-- El panel escribe con esta clave, y solo desde el servidor.
grant all privileges on table public.categories     to service_role;
grant all privileges on table public.products       to service_role;
grant all privileges on table public.product_images to service_role;

-- ------------------------------------------------------------ capa 2: RLS

-- Solo hay políticas de SELECT. Al no existir política de INSERT, UPDATE ni
-- DELETE, esas operaciones quedan denegadas para cualquier rol que no se salte
-- RLS — incluso si alguien volviera a concederles el privilegio por error.

-- ................................................................ categorías

drop policy if exists "categorias activas visibles" on public.categories;
create policy "categorias activas visibles"
  on public.categories
  for select
  to anon, authenticated
  using (is_active);

-- .................................................................. productos

drop policy if exists "productos publicados visibles" on public.products;
create policy "productos publicados visibles"
  on public.products
  for select
  to anon, authenticated
  using (status = 'published');

-- ......................................................... imágenes de producto

-- Una imagen es tan visible como el producto del que cuelga.
drop policy if exists "imagenes de productos publicados" on public.product_images;
create policy "imagenes de productos publicados"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.status = 'published'
    )
  );

-- ------------------------------------------------------------ comprobación
--
-- 1. RLS activo en las tres tablas:
--
--      select tablename, rowsecurity
--      from pg_tables
--      where schemaname = 'public'
--        and tablename in ('products', 'categories', 'product_images');
--
--    Las tres deben devolver rowsecurity = true.
--
-- 2. `anon` solo tiene SELECT:
--
--      select table_name, privilege_type
--      from information_schema.role_table_grants
--      where grantee = 'anon'
--        and table_schema = 'public'
--      order by table_name, privilege_type;
--
--    Debe aparecer SELECT y nada más para las tres tablas.
--
-- 3. Al probarlo desde el cliente, usa un INSERT, no un UPDATE.
--
--    Un UPDATE o un DELETE denegado por RLS no devuelve error: afecta a cero
--    filas y responde 204. Comprobar "¿hubo error?" da un falso positivo. Lo
--    fiable es intentar un INSERT (que sí falla con 42501) o verificar que la
--    fila no cambió realmente leyéndola después con `service_role`.

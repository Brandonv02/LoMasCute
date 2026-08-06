-- ============================================================
-- Lo Más Cute — Configuración de la tienda
-- 0005_site_settings: tabla clave/valor + bucket "site"
-- ============================================================
--
-- Todo lo que hoy vivía escrito a mano en `src/config/site.ts` (nombre,
-- descripción, redes, pagos, envíos y el hero de la portada) pasa a la base.
--
-- Por qué clave/valor y no una fila con una columna por dato:
--
--  · Añadir un ajuste nuevo es un `insert`, no una migración de esquema. La
--    portada va a seguir creciendo y no queremos una migración por cada texto.
--  · `jsonb` guarda por igual un texto ("Nequi") y una lista
--    (["Nequi", "Bancolombia"]) sin inventar tablas satélite.
--  · La aplicación mantiene el tipado en `src/lib/site-settings.ts`: la base
--    guarda pares, pero el código sigue viendo un objeto tipado con sus
--    valores por defecto.
--
-- Las semillas entran **vacías** a propósito. La tienda no debe mostrar nada
-- que no haya escrito una persona: una sección sin dato real se oculta.

-- ------------------------------------------------------------------ tabla

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default 'null'::jsonb,
  updated_at  timestamptz not null default now(),

  constraint site_settings_key_format check (key ~ '^[a-z0-9]+(_[a-z0-9]+)*$')
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

comment on table public.site_settings is
  'Ajustes públicos de la tienda en pares clave/valor. El contrato tipado vive en src/lib/site-settings.ts.';

-- --------------------------------------------------------------- semillas

-- `do nothing`: si el ajuste ya existe, esta migración no pisa lo que haya
-- guardado el panel.
insert into public.site_settings (key, value) values
  ('store_name',        '""'::jsonb),
  ('store_description', '""'::jsonb),
  ('hero_title',        '""'::jsonb),
  ('hero_subtitle',     '""'::jsonb),
  ('hero_cta_label',    '""'::jsonb),
  ('hero_cta_href',     '""'::jsonb),
  ('hero_image_path',   '""'::jsonb),
  ('instagram_url',     '""'::jsonb),
  ('tiktok_url',        '""'::jsonb),
  ('facebook_url',      '""'::jsonb),
  ('whatsapp_number',   '""'::jsonb),
  ('contact_email',     '""'::jsonb),
  ('payment_methods',   '[]'::jsonb),
  ('shipping_text',     '""'::jsonb),
  ('delivery_time',     '""'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------ privilegios

-- Misma regla que en 0002_rls: una tabla nueva nace con insert/update/delete
-- concedidos a `anon` y `authenticated`. Se los quitamos y devolvemos solo la
-- lectura; el panel escribe con `service_role` desde el servidor.

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant all privileges on table public.site_settings to service_role;

-- Todos estos ajustes se pintan en la tienda: no hay nada que esconder.
drop policy if exists "ajustes visibles" on public.site_settings;
create policy "ajustes visibles"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------- storage

-- Bucket propio para el arte de la tienda (hoy, la imagen del hero). Separado
-- de "products" porque no es catálogo: no se borra al eliminar un producto ni
-- cuenta para el tope de imágenes por ficha.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site',
  'site',
  true,
  5242880, -- 5 MB, igual que el bucket de producto
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site lectura publica" on storage.objects;
create policy "site lectura publica"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'site');

-- Sin políticas de escritura: solo `service_role`, que es quien firma las
-- subidas del panel.

-- ------------------------------------------------------------ comprobación
--
--   select key, value from public.site_settings order by key;
--
-- Deben aparecer las quince claves, todas vacías hasta que alguien guarde
-- desde /admin/configuracion.

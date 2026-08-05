-- ============================================================
-- Lo Más Cute — Storage
-- 0003_storage: bucket "products"
-- ============================================================
--
-- El bucket se crea ahora aunque la subida de imágenes llegue en una fase
-- posterior: así `product_images.storage_path` ya apunta a un sitio real y
-- la migración de datos no depende de una configuración hecha a mano en el
-- panel de Supabase.
--
-- Es público en lectura porque son fotos de catálogo servidas a cualquier
-- visitante; que la URL sea adivinable no expone nada. La escritura queda
-- reservada a `service_role`, igual que las tablas.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880, -- 5 MB por archivo: de sobra para una foto de producto optimizada
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------- políticas

-- Lectura pública de los objetos del bucket.
drop policy if exists "products lectura publica" on storage.objects;
create policy "products lectura publica"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'products');

-- Sin políticas de insert/update/delete: solo `service_role` escribe, y lo
-- hace desde el servidor. Cuando exista autenticación, aquí van las
-- políticas para `authenticated`.

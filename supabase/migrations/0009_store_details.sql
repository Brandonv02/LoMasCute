-- ============================================================
-- Lo Más Cute — El resto de la configuración de la tienda
-- 0009_store_details: marca, ciudad y condiciones de envío
-- ============================================================
--
-- Con esta migración desaparece `src/config/site.ts`: la razón social, el
-- eslogan, la ciudad, la cobertura de entrega, el costo del domicilio, el tope
-- de envío gratis y los barrios del checkout dejan de estar escritos en el
-- código y pasan a administrarse desde /admin/configuracion.
--
-- Los dos importes son números (jsonb los guarda igual que un texto) porque el
-- carrito calcula con ellos. `0` significa "todavía sin definir": el carrito
-- entonces no promete un costo ni pinta la barra de envío gratis.
--
-- Como en 0005 y 0008, las semillas entran vacías: la tienda oculta lo que
-- nadie haya escrito.

insert into public.site_settings (key, value) values
  ('legal_name',              '""'::jsonb),
  ('tagline',                 '""'::jsonb),
  ('store_city',              '""'::jsonb),
  ('shipping_zone',           '""'::jsonb),
  ('shipping_price',          '0'::jsonb),
  ('free_shipping_from',      '0'::jsonb),
  ('shipping_neighborhoods',  '[]'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------ comprobación
--
--   select key, value from public.site_settings order by key;
--
-- Deben aparecer las veinticinco claves del contrato de
-- src/lib/site-settings.ts, vacías hasta que alguien guarde desde el panel.

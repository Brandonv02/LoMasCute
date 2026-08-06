-- ============================================================
-- Lo Más Cute — Datos de contacto administrables
-- 0008_contact_details: teléfono, horario y dirección
-- ============================================================
--
-- La página de contacto tenía el teléfono, el horario y la dirección escritos
-- en el código. Pasan aquí para que se administren desde /admin/configuracion,
-- igual que el WhatsApp y el correo.
--
-- Como en 0005, la tabla es clave/valor: sumar un ajuste es un `insert`, no una
-- migración de esquema. Y entran **vacíos** a propósito: la página oculta el
-- dato que nadie haya escrito en vez de inventarlo.

insert into public.site_settings (key, value) values
  ('contact_phone',  '""'::jsonb),
  ('business_hours', '""'::jsonb),
  ('store_address',  '""'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------ comprobación
--
--   select key, value from public.site_settings
--   where key in ('contact_phone', 'business_hours', 'store_address');
--
-- Deben aparecer las tres claves, vacías hasta que alguien guarde desde el
-- panel.

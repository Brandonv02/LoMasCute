-- ============================================================
-- Lo Más Cute — Apariencia de marca
-- 0013_brand_theme: logo y paleta de colores en site_settings
-- ============================================================
--
-- `site_settings` es clave/valor (ver 0005_site_settings.sql), así que un
-- ajuste nuevo es un `insert`, no una migración de esquema. Esta migración
-- solo deja la semilla documentada; sin ella, `settingsFromRows` en
-- src/lib/site-settings.ts ya trata cualquier clave ausente como vacía.
--
-- Claves nuevas:
--
--   · logo_path        — ruta del logo dentro del bucket "site" (carpeta
--                         "brand"). Vacía: la tienda usa el logo de fábrica.
--   · color_primary    — reemplaza --color-rose (y sus tonos derivados)
--   · color_secondary  — reemplaza --color-mint
--   · color_accent     — reemplaza --color-lavender
--   · color_background — reemplaza --color-cream
--
-- Los cuatro colores son hex (`#rrggbb`) o vacío. Un color vacío conserva el
-- pastel de fábrica solo para ese tono: no hay "todo o nada". La conversión a
-- los tonos claros/oscuros que usa el sistema de diseño vive en
-- src/lib/theme.ts, no en la base.

insert into public.site_settings (key, value) values
  ('logo_path',        '""'::jsonb),
  ('color_primary',    '""'::jsonb),
  ('color_secondary',  '""'::jsonb),
  ('color_accent',     '""'::jsonb),
  ('color_background', '""'::jsonb)
on conflict (key) do nothing;

-- Ni el bucket "site" ni sus políticas cambian: el logo se guarda en el mismo
-- bucket público que la imagen del hero (ver 0005_site_settings.sql), solo
-- que en la carpeta "brand" en vez de "hero".

-- ------------------------------------------------------------ comprobación
--
--   select key, value from public.site_settings
--   where key in ('logo_path', 'color_primary', 'color_secondary', 'color_accent', 'color_background')
--   order by key;
--
-- Deben aparecer las cinco claves, vacías hasta que alguien las guarde desde
-- /admin/configuracion → Apariencia.

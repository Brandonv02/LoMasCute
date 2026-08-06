# Supabase — configuración

Integración inicial del módulo **Productos** del panel. La tienda pública no
toca Supabase todavía: sigue leyendo el catálogo estático de `src/data/`.

## 1. Crear el proyecto

1. Entra en [supabase.com](https://supabase.com) → **New project**.
2. Región: la más cercana a Colombia (`us-east-1` suele ser la mejor opción).
3. Guarda la contraseña de la base de datos que te pida.

## 2. Aplicar las migraciones

En el panel de Supabase → **SQL Editor** → **New query**, y ejecuta los
archivos **en orden**, uno por uno:

| Orden | Archivo | Qué hace |
|---|---|---|
| 1 | `migrations/0001_init.sql` | Tablas `categories`, `products`, `product_images`, enums, índices y triggers |
| 2 | `migrations/0002_rls.sql` | Activa RLS y crea las políticas de lectura pública |
| 3 | `migrations/0003_storage.sql` | Crea el bucket `products` y su política de lectura |
| 4 | `migrations/0004_catalog_fields.sql` | Campos adicionales del catálogo |
| 5 | `migrations/0005_site_settings.sql` | Tabla `site_settings`, su RLS y el bucket `site` (imagen del hero) |
| 6 | `migrations/0006_orders.sql` | Tablas `orders` y `order_items` + las funciones que mueven el stock |
| 7 | `migrations/0007_orders_cancel_stock.sql` | Cancelar una venta devuelve su stock (y reactivarla lo vuelve a descontar) |
| 8 | `seed.sql` *(opcional)* | Carga las 6 categorías y los 22 productos actuales |

El seed es idempotente: puedes volver a ejecutarlo sin duplicar nada.

> Si prefieres la CLI: `supabase link --project-ref <ref>` y luego
> `supabase db push`. Los archivos ya están en el formato que espera.

## 3. Copiar las credenciales

**Project Settings → API**:

| Valor en Supabase | Variable en `.env.local` |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

```bash
cp .env.example .env.local
# rellena los tres valores y reinicia el servidor
npm run dev
```

Sin estas variables el panel no falla: las secciones de Productos y Categorías
muestran un aviso explicando qué falta.

## 4. Comprobar

Abre `/admin/productos`. Deberías ver el catálogo, poder crear un producto,
editarlo, cambiar su estado y su stock, y eliminarlo.

Para verificar que RLS quedó activo, en el SQL Editor:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('products', 'categories', 'product_images');
```

Las tres filas deben devolver `rowsecurity = true`.

## 5. Configurar la tienda

Tras aplicar `0005_site_settings.sql`, abre **`/admin/configuracion`** y rellena
nombre, descripción, hero (imagen incluida), redes, contacto, envíos y métodos
de pago.

La portada solo pinta lo que esté guardado: **un campo vacío oculta su bloque**
en vez de mostrar un texto de ejemplo. Recién aplicada la migración, la tabla
llega con las quince claves vacías, así que la portada será mínima hasta que se
configure.

La imagen del hero se sube desde el propio panel y vive en el bucket `site` de
Supabase Storage; la base guarda la ruta, no la URL.

`npm run supabase:check` verifica también esta migración: que la tabla existe,
que la clave anónima no puede escribirla y que el bucket `site` está creado.

---

## Cómo está pensado el modelo de permisos

Con RLS activo y **sin** políticas de escritura, nadie puede insertar,
actualizar ni borrar con la clave anónima. El panel escribe usando la clave
`service_role`, que se salta RLS y **solo existe en el servidor**
(`src/lib/supabase/client.ts` está marcado con `server-only`, así que un
import desde el navegador rompe la compilación).

Dicho claro: **hoy la seguridad del panel es que `/admin` no está protegido
por autenticación pero tampoco expone la clave**. Cualquiera que llegue a la
URL puede editar el catálogo. Eso se resuelve en la fase de autenticación:

1. Añadir login con Supabase Auth.
2. Sustituir `adminClient()` por un cliente con la sesión del usuario.
3. Añadir en `0002_rls.sql` las políticas de `insert`/`update`/`delete` contra
   `authenticated` con comprobación de rol.

Ese archivo es el único que habría que tocar del lado de la base.

## Decisiones del esquema

- **`price` es entero**, no decimal. El peso colombiano no usa centavos y la
  coma flotante no debe acercarse al dinero. La columna `currency` deja abierta
  otra moneda sin migrar datos.
- **`status` es un enum** (`draft` / `published` / `archived`), no un booleano:
  "borrador" y "archivado" son estados distintos y hacen falta desde el día uno.
- **`product_images` es una tabla aparte** desde el principio, aunque la subida
  llegue después: un producto tiene varias vistas y el orden importa. Guarda la
  ruta dentro del bucket, no la URL, para poder cambiar de dominio o proveedor
  sin reescribir filas.
- **Búsqueda con columna generada + índice GIN** y `unaccent`, para que "serum"
  encuentre "sérum" y para que siga funcionando con miles de referencias.
- **`updated_at` lo mantiene un trigger**, no la aplicación: así ninguna ruta de
  escritura puede olvidarse de actualizarlo.

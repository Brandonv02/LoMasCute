# Supabase — configuración

Supabase es la única fuente de datos del proyecto: catálogo, estructura de
categorías, pedidos y ajustes de la tienda. No queda nada del catálogo escrito
en el código.

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
| 8 | `migrations/0008_contact_details.sql` | Teléfono, horario y dirección administrables |
| 9 | `migrations/0009_store_details.sql` | Razón social, eslogan, ciudad y condiciones de envío |
| 10 | `migrations/0010_catalog_taxonomy.sql` | Tabla `subcategories`, SEO e icono por categoría, y migración automática de las subcategorías que hoy son texto en los productos |

No hay seed de catálogo: el proyecto no trae productos ni categorías de
ejemplo. Las categorías y los productos se crean desde el panel.

> Si prefieres la CLI: `supabase link --project-ref <ref>` y luego
> `supabase db push`. Los archivos ya están en el formato que espera.

## 3. Copiar las credenciales

**Project Settings → API**:

| Valor en Supabase | Variable | Formato |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| Clave pública | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` o JWT con `role: anon` |
| Clave privada | `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_…` o JWT con `role: service_role` |

> **La privada no se puede confundir con la pública.** Si en
> `SUPABASE_SERVICE_ROLE_KEY` acaba la clave pública, nada falla al arrancar —el
> catálogo es público y se lee igual— pero el panel entra a la base como `anon` y
> `/admin/pedidos` responde `permission denied for table orders`, porque `orders`
> y `order_items` están cerradas a esa clave a propósito (0006_orders.sql).
> Lo mismo si rotas las claves y el despliegue se queda con la anterior:
> Supabase contesta `Unregistered API key`.
>
> Las dos variables tienen que estar **también en producción** (Vercel →
> Settings → Environment Variables → Production) y volver a desplegar después de
> cambiarlas. `npm run supabase:check` comprueba las dos cosas: que cada clave es
> de la clase correcta y que la privada puede leer `orders` mientras la pública
> no.

```bash
cp .env.example .env.local
# rellena los tres valores y reinicia el servidor
npm run dev
```

Sin estas variables el panel no falla: las secciones de Productos y Categorías
muestran un aviso explicando qué falta.

## 4. Comprobar

Abre `/admin/productos`. La tabla arranca vacía —el proyecto no siembra
catálogo— y deberías poder crear un producto, editarlo, cambiar su estado y su
stock, y eliminarlo.

Para verificar que RLS quedó activo, en el SQL Editor:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('products', 'categories', 'product_images');
```

Las tres filas deben devolver `rowsecurity = true`.

## 5. Configurar la tienda

Tras aplicar `0005`, `0008` y `0009`, abre **`/admin/configuracion`** y rellena
marca (nombre, razón social, eslogan, ciudad, descripción), hero (imagen
incluida), redes, contacto (WhatsApp, correo, teléfono, horario, dirección),
envíos (cobertura, costo, envío gratis desde, barrios) y métodos de pago.

La tienda solo pinta lo que esté guardado: **un campo vacío oculta su bloque**
en vez de mostrar un texto de ejemplo. Recién aplicadas las migraciones, todas
las claves llegan vacías, así que la tienda será mínima hasta que se configure.

La imagen del hero se sube desde el propio panel y vive en el bucket `site` de
Supabase Storage; la base guarda la ruta, no la URL.

`npm run supabase:check` verifica también esta migración: que la tabla existe,
que la clave anónima no puede escribirla y que el bucket `site` está creado.

## 6. Estructura del catálogo

`0010_catalog_taxonomy.sql` cierra el último punto en el que había que tocar
código para crecer. Tras aplicarla, en **`/admin/categorias`** se crean, editan,
ordenan, activan y eliminan categorías, y cada una admite subcategorías
ilimitadas. Los productos eligen categoría y, opcionalmente, una de sus
subcategorías desde **`/admin/productos`**.

La migración es idempotente y arrastra sola lo que ya existía: cada texto
distinto de `products.subcategory` se convierte en una fila de `subcategories`
de su categoría y los productos quedan enlazados. La columna de texto sigue ahí
porque de ella se alimenta la búsqueda sin acentos, pero ya no se escribe a
mano: un disparador la mantiene igual al nombre de la subcategoría enlazada.

Mientras la migración no esté aplicada, la tienda sigue funcionando con la
estructura anterior —el servicio de catálogo detecta el esquema viejo y usa la
consulta de antes— así que se puede desplegar el código primero y ejecutar el
SQL después sin dejar la tienda vacía.

## 7. Acceso al panel (Supabase Auth)

`/admin` está cerrado con Supabase Auth: sin sesión, cualquier ruta del panel
redirige a `/admin/login`. **No hay registro desde la aplicación**; la cuenta se
crea aquí, y son tres pasos que se hacen una sola vez.

### 7.1 Cerrar el registro público — hazlo primero

**Authentication → Sign In / Providers → Email → «Allow new users to sign up»:
apágalo.** Mientras esté encendido, cualquiera que conozca la URL del proyecto y
la clave publicable —que viaja en el navegador por diseño— puede crearse una
cuenta.

### 7.2 Crear la cuenta del equipo

**Authentication → Users → Add user → Create new user**, con correo y contraseña.
Marca «Auto Confirm User» para no depender del correo de confirmación.

### 7.3 Marcarla como administradora

Tener cuenta no da acceso: el panel exige una marca que solo se puede escribir
con la clave privada. En **SQL Editor**:

```sql
update auth.users
   set raw_app_meta_data =
       coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 where email = 'tucorreo@tudominio.com';
```

Comprobar quién tiene acceso:

```sql
select email, raw_app_meta_data ->> 'role' as rol, last_sign_in_at
from auth.users
order by created_at;
```

Quien inicie sesión sin esa marca recibe «Esa cuenta no tiene acceso al panel» y
la sesión se cierra en el acto.

> La sesión vive en cookies `httpOnly` que escribe el servidor y se renueva
> sola: sobrevive a recargas y a cerrar el navegador. El botón de la barra
> superior la cierra. Nada de esto usa la clave privada: la sesión se valida con
> la clave pública, y `service_role` sigue viviendo solo en el servidor.

---

## Cómo está pensado el modelo de permisos

Con RLS activo y **sin** políticas de escritura, nadie puede insertar,
actualizar ni borrar con la clave anónima. El panel escribe usando la clave
`service_role`, que se salta RLS y **solo existe en el servidor**
(`src/lib/supabase/client.ts` está marcado con `server-only`, así que un
import desde el navegador rompe la compilación).

Desde la fase de autenticación, `/admin` exige sesión de Supabase Auth y cuenta
marcada como administradora (ver el paso 7). El panel sigue leyendo y
escribiendo con `service_role` desde el servidor: lo que cambió es que ahora
nadie llega a esas rutas sin identificarse. La clave privada nunca sale del
servidor y las tablas privadas —`orders`, `order_items`— siguen cerradas a la
clave pública.

El siguiente paso natural, cuando haya más de una persona en el equipo, es
mover la autorización a la base: políticas de `insert`/`update`/`delete` en
`0002_rls.sql` contra `authenticated` comprobando el rol, y sustituir
`adminClient()` por un cliente con la sesión de quien opera. Ese archivo es el
único que habría que tocar del lado de la base.

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

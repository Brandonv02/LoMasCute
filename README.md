# Lo Más Cute

Tienda online premium para **Lo Más Cute** — una marca lifestyle de Medellín que
hoy vende maquillaje y mañana puede vender skincare, papelería, perfumes,
decoración o regalos **sin rediseñar nada de su identidad**.

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lenis

---

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # producción
npm run qa -- http://localhost:3000   # barrido visual en 4 viewports
```

---

## Lo primero que debes cambiar

Nada de esto vive en el código: **todo se administra desde el panel**.

| Qué | Dónde |
| --- | --- |
| Nombre, razón social, eslogan, ciudad, descripción | `/admin/configuracion` |
| WhatsApp, correo, teléfono, horario, dirección | `/admin/configuracion` |
| Instagram, TikTok, Facebook | `/admin/configuracion` |
| Cobertura, costo del envío, envío gratis desde, barrios | `/admin/configuracion` |
| Métodos de pago | `/admin/configuracion` |
| Categorías, subcategorías, orden y SEO del catálogo | `/admin/categorias` |
| Productos, fichas e imágenes | `/admin/productos` |
| Mensajes del formulario de contacto | `/admin/mensajes` |
| Pedidos de la tienda y ventas a mano | `/admin/pedidos` |

Lo único que sigue en el código es lo que no es información de la tienda: el
dominio del despliegue, el idioma, la moneda y las rutas, en
[`src/config/app.ts`](src/config/app.ts). El dominio se puede sobreescribir con
`NEXT_PUBLIC_SITE_URL`.

---

## Estructura

```
src/
├── app/                        rutas (App Router)
│   ├── layout.tsx              fuentes, SEO global, splash, atmósfera
│   ├── page.tsx                inicio
│   ├── tienda/                 catálogo con filtros y búsqueda
│   ├── categoria/[slug]/       una página por categoría
│   ├── producto/[slug]/        ficha con galería, zoom, opiniones y FAQ
│   ├── checkout/               compra sin cuenta
│   ├── favoritos/  comparar/   listas guardadas en el navegador
│   ├── nosotros/  contacto/
│   ├── legal/[slug]/           envíos, devoluciones, términos, privacidad
│   ├── sitemap.ts  robots.ts   SEO técnico
│   └── not-found.tsx
├── components/
│   ├── atmosphere/             partículas, aurora, destellos, cursor
│   ├── motion/                 reveals, parallax, tilt 3D, scroll suave
│   ├── layout/                 header, footer, redes flotantes
│   ├── product/                card, vista rápida, galería, comparador
│   ├── sections/               hero, categorías, carrusel, reseñas, feeds…
│   ├── cart/  checkout/  search/  contact/
│   └── ui/                     botón, campos, badges, estrellas, iconos
├── config/app.ts               constantes del despliegue (no de la tienda)
├── data/legal.ts               legales, redactados desde site_settings
├── services/                   catálogo, categorías, pedidos, mensajes, ajustes
├── lib/checkout.ts             contrato del checkout (cliente + servidor)
└── lib/                        store del carrito, SEO, tipos, utilidades
```

---

## Sistema de diseño

Los tokens viven en el bloque `@theme` de
[`src/app/globals.css`](src/app/globals.css) y se usan como clases normales de
Tailwind (`bg-rose`, `text-mint`, `shadow-soft`, `animate-float`…).

| Token | Valor | Uso |
| --- | --- | --- |
| `rose` | `#F8B6C8` | color principal |
| `rose-soft` / `rose-mist` | `#FCD6E2` / `#FDEAF1` | fondos y degradados |
| `mint` | `#BFDCD5` | acentos, confirmaciones, WhatsApp |
| `lavender` | `#DCCEF5` | acentos, novedades |
| `peach` | `#F7D7C4` | acentos cálidos |
| `gold` | `#F4D58D` | estrellas, destellos, "más vendido" |
| `cream` | `#FFF7F4` | fondo de toda la tienda |

**Tipografía:** Fredoka para títulos (`font-display`), Poppins para todo lo
demás (`font-sans`), con mucho aire entre bloques.

### Una nota sobre el gris de marca y el contraste

El `#8A8A8A` de la paleta da **3.0:1** sobre crema, por debajo del mínimo AA
(4.5:1) para texto normal. Para no romper la accesibilidad sin perder el gris
cálido de la marca, se derivaron dos tonos de la misma familia:

- `text-ink` `#4A4145` — texto principal (**9.8:1**)
- `text-ink-soft` `#6B6165` — texto secundario (**5.9:1**)
- `text-ink-muted` `#8A8A8A` — el gris original, reservado para texto
  decorativo, etiquetas grandes y elementos no informativos

Se ve igual de suave, pero se puede leer.

---

## Movimiento

Casi todo el movimiento es declarativo y reutilizable:

```tsx
<Reveal kind="blur" delay={0.1}>…</Reveal>     {/* fade + slide + blur reveal */}
<Stagger><StaggerItem>…</StaggerItem></Stagger> {/* cascada */}
<Parallax speed={40}>…</Parallax>               {/* parallax al hacer scroll */}
<Tilt max={9}>…</Tilt>                          {/* inclinación 3D con el cursor */}
<Magnetic>…</Magnetic>                          {/* el botón se acerca al cursor */}
<PastelParticles /> <Aurora /> <Twinkles />     {/* atmósfera */}
```

Los botones llevan efecto líquido (`.btn-liquid`, el brillo nace donde está el
cursor), las cards se levantan (`.card-lift`) y el scroll tiene inercia con
Lenis.

**Todo respeta `prefers-reduced-motion`:** si el visitante pidió menos
movimiento en su sistema, las partículas y el splash no se montan, Lenis no se
activa y las transiciones se reducen a cero. Nadie se marea.

---

## Tareas frecuentes

### Agregar un producto

Desde **/admin/productos → Nuevo producto**. Ahí se cargan nombre, precio,
stock, categoría, ficha (tonos, ingredientes, modo de uso, preguntas) e
imágenes, que van al bucket `products` de Storage.

No hay catálogo escrito en el código: la tienda, la búsqueda, el sitemap y los
relacionados leen lo que esté publicado en la base. Un producto sin imágenes
sale sin foto, y ninguna sección inventa datos para rellenar.

### Abrir una categoría o una subcategoría

Desde **/admin/categorias**, y no hace falta tocar código ni desplegar:

- Crear, editar, activar/desactivar, reordenar y eliminar categorías.
- Nombre, slug, claim, descripción, imagen, color, icono, orden, estado y SEO
  (título y descripción propios).
- Subcategorías ilimitadas dentro de cada categoría, con su nombre, slug, orden
  y estado. Un producto pertenece a una categoría y, si quieres, a una de sus
  subcategorías.

Reglas que aplica la tienda sola:

- Categoría o subcategoría inactiva → no aparece (lo impone RLS, no el código).
- **Categoría sin productos publicados → no aparece**, salvo que esté marcada
  como «muy pronto», que es la forma de anunciarla vacía. Al publicar el primer
  producto entra sola en el menú, la vitrina y los filtros.

Si quieres arte pastel para la tarjeta, súmala a `CATEGORIES` en
`scripts/generate-art.mjs` y corre `npm run art`.

### Cambiar envíos, pagos o contacto

Todo vive en **/admin/configuracion** (tabla `site_settings`): nombre, razón
social, eslogan, ciudad, WhatsApp, correo, teléfono, horario, dirección, redes,
cobertura, costo del domicilio, envío gratis desde, barrios de entrega y medios
de pago. Lo que se deje vacío no se muestra en ningún sitio.

### Leer y responder los mensajes de contacto

El formulario de `/contacto` guarda de verdad. Cada mensaje entra en la tabla
`contact_messages` y aparece en **/admin/mensajes**, con su correo y su teléfono
para responder, cuatro estados (nuevo, leído, respondido, archivado) y una
pastilla en el menú del panel con los que quedan sin abrir.

Cómo está montado, de fuera hacia dentro:

| Pieza | Archivo |
| --- | --- |
| Formulario | [`src/components/contact/contact-form.tsx`](src/components/contact/contact-form.tsx) |
| Contrato de validación, compartido cliente/servidor | [`src/lib/contact.ts`](src/lib/contact.ts) |
| Server Action pública | [`src/app/actions/contact.ts`](src/app/actions/contact.ts) |
| Acceso a la tabla | [`src/services/contact.ts`](src/services/contact.ts) |
| Bandeja del panel | [`src/app/admin/(panel)/mensajes/`](src/app/admin/(panel)/mensajes/) |

Tres cosas que conviene saber antes de tocarlo:

- **La tabla está cerrada a la clave pública**, también para escribir. No es
  celo de más: si `anon` pudiera insertar, cualquiera tendría un grifo abierto
  contra ella, y RLS no sabe contar cuántos mensajes lleva alguien en la última
  hora. Todo entra por la Server Action, que corre en el servidor.
- **El esquema de validación es uno solo** (`src/lib/contact.ts`), usado por el
  formulario y por la acción. Una Server Action es un endpoint HTTP: se puede
  llamar sin pasar por la interfaz, así que el servidor no se cree nada.
- **Hay un campo trampa** oculto en el formulario. Si llega relleno, el envío se
  descarta y se responde «enviado»: decirle a un robot que falló solo le enseña
  qué campo evitar la próxima vez.

El límite de 5 mensajes por correo y hora es cortesía, no antiabuso: evita el
duplicado por doble clic y el spam casual. El límite serio va en el borde
(Vercel, Cloudflare), donde se ve la IP.

### Recibir y confirmar un pedido de la tienda

El checkout guarda de verdad. Quien compra en `/checkout` deja su pedido
completo —datos, dirección, barrio, líneas con su tono, notas y si es un
regalo— y aparece en **/admin/pedidos** marcado como «Pedido web», con una
pastilla en el menú del panel contando los que faltan por confirmar.

**Un pedido web es un aviso, no una venta.** Entra en `pendiente` y **no toca el
inventario**. Cuando lo revisas y lo pasas a **pagado**, ahí se descuenta el
stock; si lo cancelas, vuelve. Es el mismo flujo que ya se hacía por WhatsApp,
solo que sin transcribir nada a mano.

| Pieza | Archivo |
| --- | --- |
| Formulario | [`src/components/checkout/checkout-form.tsx`](src/components/checkout/checkout-form.tsx) |
| Contrato de validación, compartido cliente/servidor | [`src/lib/checkout.ts`](src/lib/checkout.ts) |
| Server Action pública | [`src/app/actions/checkout.ts`](src/app/actions/checkout.ts) |
| Acceso a la tabla | [`src/services/orders.ts`](src/services/orders.ts) |
| Regla de stock y creación del pedido | [`supabase/migrations/0012_customer_orders.sql`](supabase/migrations/0012_customer_orders.sql) |

Lo que hay que saber antes de tocarlo:

- **El navegador no manda ni un precio.** El carrito vive en `localStorage` y
  guarda el precio que tenía el producto el día que se agregó, además de ser
  editable por cualquiera antes de enviar. Solo viajan `productId`, cantidad y
  tono; el precio sale del catálogo y el domicilio de `site_settings`, los dos
  dentro de la base. Si el total guardado no coincide con el que se mostró, la
  pantalla de confirmación lo dice en vez de callarlo.
- **La regla de inventario vive en un solo sitio**, la función
  `order_status_retains_stock`: `pagado` y `entregado` retienen, `pendiente` y
  `cancelado` no. El disparador compara eso con `stock_returned` y solo mueve
  stock si difieren, así que confirmar dos veces o cancelar dos veces no
  descuadra nada.
- **Se comprueba el stock, pero no se reserva.** Dos personas pueden pedir la
  última unidad: nadie ha pagado y nada está apartado. El segundo pedido fallará
  al confirmarse, con el mismo mensaje que ya da el panel. Es exactamente lo que
  pasa con dos WhatsApp seguidos.
- **Hay llave contra el doble envío.** El navegador genera un uuid por intento;
  si el mismo pedido llega dos veces, la base devuelve el que ya existe en vez
  de crear otro. Y si el envío falla, el carrito **no** se vacía.

### Que te avise un correo cuando entra un pedido

Al guardarse un pedido web sale un correo a la tienda con todo lo necesario para
atenderlo: código, total con su desglose, datos del cliente, dirección, los
productos con su tono, si es un regalo, las notas y un enlace directo a la ficha
en el panel. Si le das a «Responder», le escribes al cliente.

Para encenderlo hacen falta dos minutos y una variable:

1. Crea una cuenta en [resend.com](https://resend.com) (gratis hasta 3.000
   correos al mes) y saca una API key en **API Keys**.
2. Ponla como `RESEND_API_KEY`, en `.env.local` y en producción (Vercel →
   Settings → Environment Variables), y vuelve a desplegar.

Con eso ya llega. El remitente por defecto es `onboarding@resend.dev`, el de
pruebas de Resend, que **solo entrega al correo con el que registraste la
cuenta** — suficiente para tus propios avisos y sin tocar DNS. Para escribirle a
cualquier otra dirección hay que verificar tu dominio en Resend y poner
`EMAIL_FROM=pedidos@tudominio.com`.

El destinatario es el correo de la tienda que esté guardado en
`/admin/configuracion`, así que se cambia desde el panel sin desplegar.
`ORDER_NOTIFICATION_EMAIL` existe solo para mandar los avisos internos a una
dirección distinta de la que se publica en la web.

Cómo está montado:

| Pieza | Archivo |
| --- | --- |
| Transporte (API de Resend por HTTP, sin dependencias) | [`src/lib/email.ts`](src/lib/email.ts) |
| Redacción y envío del aviso | [`src/services/notifications.ts`](src/services/notifications.ts) |

Tres decisiones que conviene no deshacer:

- **El aviso nunca puede tumbar la venta.** Cuando se envía, el pedido ya está
  guardado y el cliente ya vio su número, así que `notifyNewOrder` no lanza:
  anota el fallo en el log y sigue. Perder una venta porque el proveedor de
  correo tuvo un mal minuto sería absurdo.
- **Va después de responder**, con `after()` de Next. Quien compra no espera a
  que Resend conteste para ver su número de pedido.
- **Un reintento no avisa dos veces.** Si alguien reenvía el mismo pedido tras un
  error de red, la base devuelve el que ya existía y no se manda un segundo
  correo: «¿me entraron dos ventas o una?» es la duda que vuelve inútil un
  sistema de avisos.

Y si la clave no está, el panel lo dice en la lista de pedidos en vez de dejarte
creer que los correos salen. Un sistema de avisos que falla en silencio se ve
igual que un día sin ventas.

### Lo que todavía no hay

**El cliente no recibe correo.** Hoy solo se avisa a la tienda. Los textos del
checkout están escritos para no prometerlo —dice «guardamos tu pedido y te
escribimos», no «te enviamos un correo»—, así que si algún día se le escribe al
cliente hay que verificar el dominio en Resend **y** revisar esos textos.

**Los mensajes de contacto tampoco avisan** por correo: se leen en
`/admin/mensajes`. Ahora que el transporte existe, sumarlo son unas pocas líneas
en la Server Action del contacto.

**No hay pasarela de pago.** El cobro se coordina por fuera (WhatsApp,
transferencia, Nequi) y es el panel quien registra que se pagó.

---

## El logo

El archivo original venía con fondo blanco sólido, así que no se podía usar
sobre los degradados pastel. `npm run logo` lo procesa: hace un *flood fill*
desde los bordes para volver transparente **solo** el blanco conectado al
exterior (el borde crema tipo sticker es parte del diseño y se conserva),
suaviza el canal alfa para que no queden bordes dentados y recorta el aire
sobrante.

- Fuente: `public/brand/logo-lo-mas-cute.webp`
- Resultado: `public/brand/logo-lo-mas-cute.png` ← el que usa la tienda

Si cambias el logo, reemplaza el `.webp` y corre `npm run logo`.

---

## SEO

- Metadatos por página, con `title` en plantilla y canónicas
- Open Graph y Twitter Card con imagen propia (`public/og-image.png`)
- Datos estructurados Schema.org: `Store`, `WebSite` con buscador, `Product`
  con oferta / envío / política de devolución, `BreadcrumbList`, `FAQPage` e
  `ItemList`. Solo se declara lo que tiene dato real detrás: sin tarifa de envío
  configurada no hay bloque de envío, y sin opiniones no hay calificación
- `sitemap.xml` y `robots.txt` generados desde los datos
- URLs limpias en español: `/producto/{slug}`
- Todas las imágenes pasan por `next/image` con `sizes` explícito, lazy loading
  por defecto y `priority` solo en lo que entra above the fold
- Las 44 rutas se generan estáticas en el build

---

## Accesibilidad

- Contraste AA en todo el texto (ver la nota sobre el gris de marca)
- Navegable por teclado, con anillo de foco visible y "Saltar al contenido"
- Diálogos (carrito, vista rápida, búsqueda, filtros) con `role="dialog"`,
  `aria-modal` y cierre con `Esc`
- `aria-live` en el contador de la bolsa y en el número de resultados
- Alt descriptivo en imágenes de producto, `alt=""` en lo decorativo
- Búsqueda con `role="listbox"` y navegación con flechas · atajo `⌘K` / `Ctrl+K`
- `prefers-reduced-motion` respetado en toda la capa de animación

---

## Verificado

Probado en Chrome headless a 390, 820, 1440 y 2560 px de ancho: sin
desbordamiento horizontal, sin imágenes rotas, sin errores de consola y con
datos estructurados presentes en las 15 rutas. Flujo completo comprobado —
splash, agregar a la bolsa, cambiar cantidades, vista rápida, búsqueda
tolerante a erratas, menú y filtros móviles, y persistencia de favoritos entre
páginas.

Un detalle del entorno: este proyecto está dentro de OneDrive. Si un build
falla con `EINVAL: readlink .next/...`, es la sincronización tocando la carpeta
de build — borra `.next` y vuelve a compilar.

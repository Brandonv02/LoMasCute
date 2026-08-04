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

Todo lo editable de la marca vive en **un solo archivo**:
[`src/config/site.ts`](src/config/site.ts).

| Qué | Dónde | Nota |
| --- | --- | --- |
| **Número de WhatsApp** | `contact.whatsapp` y `social[0].url` | ⚠️ Hoy tiene un placeholder `573000000000`. Cámbialo antes de publicar. |
| Correo, dirección, horario | `contact` | |
| Enlaces de redes | `social` | WhatsApp, Instagram, TikTok, Facebook, YouTube, Pinterest y Threads |
| Dominio | `url` | Usado por el sitemap, Open Graph y los datos estructurados |
| Costo y cobertura de envío | `shipping.zones` | Ver *Ampliar a más ciudades* |
| Métodos de pago | `payments` | Ver *Activar una pasarela* |

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
├── config/site.ts              ⭐ configuración de marca
├── data/                       productos, categorías, reseñas, legales
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

Añade una entrada a [`src/data/products.ts`](src/data/products.ts) y genera su
arte:

```bash
# 1. Suma el slug al array CATALOG de scripts/generate-art.mjs
#    eligiendo una familia de forma y un tono:
#    { slug: "mi-producto", shape: "jar", tone: "mint" }
npm run art
```

Formas disponibles: `lipstick`, `tube`, `compact`, `palette`, `bottle`,
`dropper`, `jar`, `brush`, `pouch`, `book`, `box`, `flask`.
Tonos: `rose`, `mint`, `lav`, `peach`, `gold`.

El producto aparece solo en la tienda, su categoría, la búsqueda, el sitemap y
los relacionados. Si quieres reemplazar el arte por fotos reales, sustituye los
archivos de `public/products/` manteniendo los nombres.

### Abrir una categoría nueva

En [`src/data/categories.ts`](src/data/categories.ts), quita `comingSoon: true`
de la categoría. Ya tiene página, arte, filtros y sitio en el menú.

Para una categoría que no existe todavía: agrégala al array, súmala a
`CATEGORIES` en `scripts/generate-art.mjs`, corre `npm run art` y añade su slug
al tipo `CategorySlug` en `src/lib/types.ts`.

### Ampliar a más ciudades

En `site.shipping.zones`, pon `active: true` en la zona `colombia`, ponle precio
y llena `neighborhoods` (o cambia el selector de barrio por uno de ciudad en
[`checkout-form.tsx`](src/components/checkout/checkout-form.tsx)). El resumen del
carrito, el checkout y los datos estructurados leen la zona activa.

### Activar una pasarela

Mercado Pago, Wompi, PayU y Stripe ya están listados con `active: false` y se
muestran como "muy pronto" en el checkout. Cambia el flag y conecta el cobro en
el `onSubmit` de `checkout-form.tsx`.

### Conectar formularios y correos

Hay tres puntos de integración, cada uno marcado con un comentario en el código:

| Formulario | Archivo |
| --- | --- |
| Pedido + correo de confirmación | `src/components/checkout/checkout-form.tsx` |
| Newsletter (Club Cute) | `src/components/sections/newsletter.tsx` |
| Contacto | `src/components/contact/contact-form.tsx` |

Hoy simulan la respuesta y muestran el estado de éxito real de la interfaz.

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
  con oferta / envío / política de devolución / opiniones, `BreadcrumbList`,
  `FAQPage` e `ItemList`
- `sitemap.xml` y `robots.txt` generados desde los datos
- URLs limpias en español: `/producto/labial-satinado-cloud-kiss`
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

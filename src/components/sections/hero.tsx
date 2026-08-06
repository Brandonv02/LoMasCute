import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles, Truck } from "lucide-react";
import type { SiteSettingsView } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import { Magnetic, Parallax, Tilt } from "@/components/motion/parallax";
import { Twinkles, Heart, Flower, Sparkle } from "@/components/atmosphere/ambient";

/**
 * Portada. Es Server Component a propósito: todo lo que antes animaba Framer
 * Motion ahora son keyframes CSS declarados en globals.css.
 *
 * El cambio no es cosmético. Con la versión anterior el hero se pintaba con
 * `opacity: 0` y no aparecía hasta que el bundle de animación se descargaba,
 * se parseaba y se hidrataba — justo lo que castiga al LCP en un iPhone con
 * red móvil. Ahora la animación arranca en el primer frame y el navegador la
 * compone sin pasar por el hilo principal.
 *
 * Todo el contenido llega de `site_settings`. Cada bloque se pinta solo si
 * tiene dato: sin imagen el hero pasa a una columna, sin botón no hay botón y
 * sin promesa de envío no hay franja. Nunca hay relleno de ejemplo.
 */

const floaters = [
  { Shape: Heart, tone: "text-rose", top: "16%", left: "7%", size: 30, delay: 0, dur: 8 },
  { Shape: Flower, tone: "text-lavender", top: "26%", right: "9%", size: 38, delay: 1.2, dur: 10 },
  { Shape: Sparkle, tone: "text-gold", top: "62%", left: "12%", size: 26, delay: 0.6, dur: 7 },
  { Shape: Heart, tone: "text-rose-soft", top: "72%", right: "14%", size: 24, delay: 1.8, dur: 9 },
  { Shape: Flower, tone: "text-mint", top: "8%", right: "26%", size: 28, delay: 2.4, dur: 11 },
  { Shape: Sparkle, tone: "text-peach", top: "48%", right: "4%", size: 22, delay: 0.9, dur: 8.5 },
];

/** Azúcar para no repetir el objeto de variables en cada bloque */
const enter = (
  duration: number,
  delay: number,
  from: { y?: number; scale?: number; blur?: number } = {},
) =>
  ({
    "--in-duration": `${duration}s`,
    "--in-delay": `${delay}s`,
    ...(from.y ? { "--in-y": `${from.y}px` } : {}),
    ...(from.scale ? { "--in-scale": `${from.scale}` } : {}),
    ...(from.blur ? { "--in-blur": `${from.blur}px` } : {}),
  }) as React.CSSProperties;

/**
 * Parte el titular por la última coma para conservar el acento de color de la
 * portada: "Cosas lindas para tu día a día, elegidas una por una". Si no hay
 * coma, el título entero va en el mismo tono. Es presentación, no contenido:
 * quien escribe en el panel no tiene que saber nada de esto.
 */
function splitTitle(title: string): [string, string] {
  const at = title.lastIndexOf(",");
  if (at < 0 || at === title.length - 1) return [title, ""];
  return [title.slice(0, at + 1), title.slice(at + 1).trim()];
}

export function Hero({
  settings,
  hasCategories = false,
}: {
  settings: SiteSettingsView;
  hasCategories?: boolean;
}) {
  const [titleLead, titleAccent] = splitTitle(settings.heroTitle);
  const hasCta = Boolean(settings.heroCtaLabel && settings.heroCtaHref);
  const hasPromise = Boolean(settings.shippingText || settings.deliveryTime);
  const image = settings.heroImageUrl;

  const brandLabel =
    [settings.storeName, settings.heroTitle].filter(Boolean).join(" — ") || "Portada";

  return (
    <section
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden pb-20 pt-10 md:min-h-[96svh] md:pb-28"
      aria-labelledby="hero-title"
    >
      {/* Cielo pastel */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-10%,#FFFFFF_0%,#FDEAF1_34%,#FFF7F4_62%,#ECE5FB_100%)]" />
        <div
          className="absolute left-1/2 top-[-18%] size-[86vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,214,226,0.75),transparent_62%)] blur-[60px]"
          style={{ animation: "heroSky 12s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-[12%] top-[36%] size-[46vmax] rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.55),transparent_66%)] blur-[70px]"
          style={{ animation: "heroBlobA 18s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-[10%] top-[10%] size-[42vmax] rounded-full bg-[radial-gradient(circle,rgba(244,213,141,0.4),transparent_68%)] blur-[70px]"
          style={{ animation: "heroBlobB 20s ease-in-out infinite" }}
        />
      </div>

      <Twinkles count={16} />

      {/* Elementos flotando */}
      <div
        aria-hidden
        className="hero-floaters pointer-events-none absolute inset-0 -z-[1] max-md:hidden"
      >
        {floaters.map((f, i) => (
          <span
            key={i}
            className={`absolute ${f.tone}`}
            style={{
              top: f.top,
              left: f.left,
              right: f.right,
              width: f.size,
              height: f.size,
              animation: `heroFloater ${f.dur}s ease-in-out ${f.delay}s infinite`,
            }}
          >
            <f.Shape className="size-full drop-shadow-[0_4px_12px_rgba(214,158,176,0.3)]" />
          </span>
        ))}
      </div>

      <div className="container-cute relative">
        <div
          className={
            image
              ? "grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8"
              : "grid items-center gap-14"
          }
        >
          {/* Copy */}
          <div
            className={
              image
                ? "relative z-10 text-center lg:text-left"
                : "relative z-10 mx-auto max-w-3xl text-center"
            }
          >
            {settings.deliveryTime && (
              <div
                className="cute-in inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 shadow-petal ring-1 ring-white/80 backdrop-blur-md"
                style={enter(0.9, 0.1, { y: 18, blur: 10 })}
              >
                <Sparkles className="size-4 text-gold" strokeWidth={2} />
                <span className="font-display text-xs uppercase tracking-[0.2em] text-ink-soft">
                  Entregas en {settings.deliveryTime}
                </span>
              </div>
            )}

            {/* Logo como titular */}
            <h1
              id="hero-title"
              className={
                image
                  ? "cute-in mt-7 flex flex-col items-center lg:items-start"
                  : "cute-in mt-7 flex flex-col items-center"
              }
              style={enter(1.4, 0.2, { y: 24, scale: 0.9, blur: 22 })}
            >
              <span className="sr-only">{brandLabel}</span>
              <span
                className="relative block"
                style={{ animation: "bobY 7s ease-in-out infinite", ["--bob" as string]: "-9px" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-[-14%] animate-glow rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.5),transparent_66%)]"
                />
                <Image
                  src="/brand/logo-lo-mas-cute.png"
                  alt=""
                  width={640}
                  height={640}
                  priority
                  sizes="(max-width: 1024px) 88vw, 40rem"
                  className="relative w-[min(86vw,34rem)] drop-shadow-[0_24px_60px_rgba(214,158,176,0.32)]"
                />
              </span>
            </h1>

            {settings.heroTitle && (
              <p
                className={
                  image
                    ? "cute-in mx-auto mt-4 max-w-lg font-display text-2xl leading-tight text-ink md:text-[2rem] lg:mx-0"
                    : "cute-in mx-auto mt-4 max-w-2xl font-display text-2xl leading-tight text-ink md:text-[2rem]"
                }
                style={enter(1, 0.75, { y: 22, blur: 12 })}
              >
                {titleLead}
                {titleAccent && <span className="text-gradient"> {titleAccent}</span>}
              </p>
            )}

            {settings.heroSubtitle && (
              <p
                className={
                  image
                    ? "cute-in mx-auto mt-4 max-w-md leading-relaxed text-ink-soft lg:mx-0"
                    : "cute-in mx-auto mt-4 max-w-xl leading-relaxed text-ink-soft"
                }
                style={enter(1, 0.9, { y: 20 })}
              >
                {settings.heroSubtitle}
              </p>
            )}

            {(hasCta || hasCategories) && (
              <div
                className={
                  image
                    ? "cute-in mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                    : "cute-in mt-9 flex flex-wrap items-center justify-center gap-3"
                }
                style={enter(1, 1.05, { y: 24 })}
              >
                {hasCta && (
                  <Magnetic>
                    <Button asChild size="xl">
                      <Link href={settings.heroCtaHref}>
                        {settings.heroCtaLabel}
                        <ArrowRight
                          className="size-4.5 transition-transform duration-500 group-hover:translate-x-1"
                          strokeWidth={2}
                        />
                      </Link>
                    </Button>
                  </Magnetic>
                )}
                {hasCategories && (
                  <Magnetic>
                    <Button asChild size="xl" variant="cream">
                      <Link href="#categorias">
                        <LayoutGrid className="size-4.5" strokeWidth={1.9} />
                        Ver categorías
                      </Link>
                    </Button>
                  </Magnetic>
                )}
              </div>
            )}

            {/* Promesa de envío: solo lo que esté configurado */}
            {hasPromise && (
              <div
                className={
                  image
                    ? "cute-in mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
                    : "cute-in mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
                }
                style={enter(1, 1.25)}
              >
                {settings.shippingText && (
                  <p className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Truck className="size-4 shrink-0 text-rose" strokeWidth={1.9} />
                    {settings.shippingText}
                  </p>
                )}
                {settings.shippingText && settings.deliveryTime && (
                  <span aria-hidden className="hidden h-4 w-px bg-rose/40 sm:block" />
                )}
                {settings.deliveryTime && (
                  <p className="text-sm text-ink-soft">
                    Entrega en{" "}
                    <strong className="font-semibold text-ink">
                      {settings.deliveryTime}
                    </strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Imagen principal: vive en Supabase Storage */}
          {image && (
            <div className="cute-in relative" style={enter(1.6, 0.35, { scale: 0.9, blur: 24 })}>
              <Parallax speed={34} className="relative">
                <Tilt max={10} className="relative mx-auto w-[min(92vw,34rem)]">
                  <div className="group relative aspect-square overflow-hidden rounded-[3rem] bg-white/45 shadow-float ring-1 ring-white/70 backdrop-blur-md">
                    <Image
                      src={image}
                      alt={
                        settings.storeName
                          ? `Imagen principal de ${settings.storeName}`
                          : "Imagen principal de la tienda"
                      }
                      fill
                      priority
                      sizes="(max-width: 1024px) 92vw, 34rem"
                      className="object-cover transition-transform duration-[1400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/35"
                    />
                  </div>

                  {/* Tarjetas flotantes: solo con dato real detrás */}
                  {settings.deliveryTime && (
                    <div
                      className="glass ambient-decor absolute -right-3 bottom-14 hidden rounded-3xl px-4 py-3 md:block"
                      style={{
                        animation: "bobY 7.5s ease-in-out 1s infinite",
                        ["--bob" as string]: "13px",
                      }}
                    >
                      <p className="flex items-center gap-1.5 font-display text-sm text-ink">
                        <span aria-hidden>🚚</span> {settings.deliveryTime}
                      </p>
                      {settings.shippingText && (
                        <p className="max-w-[12rem] text-xs text-ink-soft">
                          {settings.shippingText}
                        </p>
                      )}
                    </div>
                  )}

                  {settings.paymentMethods.length > 0 && (
                    <div
                      className="glass ambient-decor absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full px-5 py-2.5"
                      style={{
                        animation: "bobY 5.5s ease-in-out 0.5s infinite",
                        ["--bob" as string]: "-8px",
                      }}
                    >
                      <p className="whitespace-nowrap font-display text-sm text-ink">
                        {settings.paymentMethods.join(" · ")}
                      </p>
                    </div>
                  )}
                </Tilt>
              </Parallax>
            </div>
          )}
        </div>
      </div>

      {/* Invitación a bajar */}
      <div
        aria-hidden
        className="cute-in absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        style={enter(1, 1.6)}
      >
        <span className="font-display text-[0.65rem] uppercase tracking-[0.26em] text-ink-muted">
          Explora
        </span>
        <span
          className="h-10 w-px bg-gradient-to-b from-rose to-transparent"
          style={{
            animation: "scrollHint 2.6s ease-in-out infinite",
            transformOrigin: "top",
          }}
        />
      </div>
    </section>
  );
}

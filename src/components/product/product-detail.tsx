"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import toast from "react-hot-toast";
import {
  Check,
  Heart,
  Link2,
  Minus,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Undo2,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { SITE_URL } from "@/config/app";
import { useStore } from "@/lib/store";
import { useSiteSettings } from "@/components/site-settings-provider";
import { storeLabel, whatsappUrl } from "@/lib/site-settings";
import { cn, discountPercent, formatCOP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { ProductGallery } from "@/components/product/product-gallery";
import {
  FacebookIcon,
  PinterestIcon,
  WhatsappIcon,
} from "@/components/ui/social-icons";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite, toggleCompare, isComparing } = useStore();
  const settings = useSiteSettings();
  const [shade, setShade] = useState(product.shades?.[0]?.name);
  const [quantity, setQuantity] = useState(1);

  const fav = isFavorite(product.slug);
  const comparing = isComparing(product.slug);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock === 0;

  const storeName = storeLabel(settings);
  const productUrl = `${SITE_URL}/producto/${product.slug}`;
  const whatsappHref = whatsappUrl(
    settings.whatsappNumber,
    `¡Hola ${storeName}! 🌸 Quiero comprar:\n\n• ${product.name}${
      shade ? ` (${shade})` : ""
    } × ${quantity} — ${formatCOP(product.price * quantity)}\n\n${productUrl}`,
  );

  const buyNow = () => {
    addToCart(product, { shade, quantity });
    router.push("/checkout");
  };

  const share = async () => {
    const data = {
      title: product.name,
      text: `Mira este ${product.name} de ${storeName} 💕`,
      url: productUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* el usuario canceló: seguimos al portapapeles */
      }
    }
    await navigator.clipboard?.writeText(productUrl);
    toast.success("Enlace copiado ✨", { id: "share" });
  };

  return (
    <div className="container-cute">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Galería */}
        <ProductGallery
          images={product.images}
          name={product.name}
          badges={
            <>
              {product.isNew && <Badge tone="lavender">Nuevo</Badge>}
              {product.isBestseller && <Badge tone="gold">Más vendido</Badge>}
              {discount > 0 && <Badge tone="rose">−{discount}% hoy</Badge>}
            </>
          }
        />

        {/* Compra */}
        <div>
          <div
            className="cute-in"
            style={
              {
                "--in-y": "26px",
                "--in-blur": "12px",
                "--in-duration": "0.9s",
              } as React.CSSProperties
            }
          >
            <p className="font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
              {product.subcategory}
            </p>
            <h1 className="mt-3 font-display text-[2.1rem] leading-[1.08] md:text-[2.9rem]">
              {product.name}
            </h1>
            <p className="mt-2 text-ink-soft">{product.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              {/* La calificación solo aparece si hay opiniones de verdad */}
              {product.reviewsCount > 0 && (
                <>
                  <Stars rating={product.rating} size={17} showValue />
                  <span className="text-sm text-ink-soft">
                    {product.reviewsCount} opiniones
                  </span>
                </>
              )}
              {product.stock > 0 && product.stock <= 12 && (
                <span className="rounded-full bg-rose-mist px-3 py-1 text-xs text-[#a8556f]">
                  Solo quedan {product.stock}
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-[2.4rem] leading-none text-ink">
                {formatCOP(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-ink-muted line-through">
                    {formatCOP(product.compareAtPrice)}
                  </span>
                  <Badge tone="mint">
                    Ahorras {formatCOP(product.compareAtPrice - product.price)}
                  </Badge>
                </>
              )}
            </div>

            <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

            {/* Tonos */}
            {product.shades && (
              <div className="mt-8">
                <p className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
                  Tono ·{" "}
                  <span className="normal-case tracking-normal text-ink">{shade}</span>
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-3">
                  {product.shades.map((s) => (
                    <li key={s.name}>
                      <button
                        type="button"
                        onClick={() => setShade(s.name)}
                        aria-label={`Tono ${s.name}`}
                        aria-pressed={shade === s.name}
                        title={s.name}
                        className={cn(
                          "grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-cream transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)]",
                          shade === s.name
                            ? "scale-110 ring-2 ring-ink/25"
                            : "ring-1 ring-white/85 hover:scale-110",
                        )}
                        style={{ backgroundColor: s.hex }}
                      >
                        {shade === s.name && (
                          <Check className="size-4 text-ink/70" strokeWidth={2.6} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cantidad y compra */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-full bg-white/78 p-1.5 ring-1 ring-rose/25">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Quitar una unidad"
                  className="grid size-10 place-items-center rounded-full text-ink transition-colors duration-400 hover:bg-rose-soft"
                >
                  <Minus className="size-4" strokeWidth={2.2} />
                </button>
                <span className="w-9 text-center font-display text-lg text-ink" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Agregar una unidad"
                  disabled={quantity >= product.stock}
                  className="grid size-10 place-items-center rounded-full text-ink transition-colors duration-400 hover:bg-rose-soft disabled:opacity-40"
                >
                  <Plus className="size-4" strokeWidth={2.2} />
                </button>
              </div>

              <Button
                size="lg"
                variant="cream"
                className="flex-1 min-w-[12rem]"
                disabled={soldOut}
                onClick={() => addToCart(product, { shade, quantity })}
              >
                <ShoppingBag className="size-4.5" strokeWidth={1.9} />
                Agregar a la bolsa
              </Button>
            </div>

            <div
              className={cn(
                "mt-3 grid gap-3",
                whatsappHref && "sm:grid-cols-2",
              )}
            >
              <Button size="lg" disabled={soldOut} onClick={buyNow}>
                Comprar ahora
              </Button>
              {whatsappHref && (
                <Button asChild size="lg" variant="mint">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon className="size-4.5" />
                    Comprar por WhatsApp
                  </a>
                </Button>
              )}
            </div>

            {/* Favoritos, comparar, compartir */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <SecondaryAction
                onClick={() => toggleFavorite(product.slug)}
                active={fav}
                label={fav ? "En favoritos" : "Guardar en favoritos"}
              >
                <Heart className={cn("size-4", fav && "fill-current")} strokeWidth={1.9} />
              </SecondaryAction>
              <SecondaryAction
                onClick={() => toggleCompare(product.slug)}
                active={comparing}
                label={comparing ? "En comparación" : "Comparar"}
              >
                <Scale className="size-4" strokeWidth={1.9} />
              </SecondaryAction>
              <SecondaryAction onClick={share} label="Compartir">
                <Share2 className="size-4" strokeWidth={1.9} />
              </SecondaryAction>

              <span aria-hidden className="mx-1 h-5 w-px bg-rose/30" />

              <ShareLink
                href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${productUrl}`)}`}
                label="Compartir en WhatsApp"
              >
                <WhatsappIcon className="size-4" />
              </ShareLink>
              <ShareLink
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                label="Compartir en Facebook"
              >
                <FacebookIcon className="size-4" />
              </ShareLink>
              <ShareLink
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(product.name)}`}
                label="Guardar en Pinterest"
              >
                <PinterestIcon className="size-4" />
              </ShareLink>
              <ShareLink
                href={productUrl}
                label="Copiar enlace"
                onClick={(event) => {
                  event.preventDefault();
                  void share();
                }}
              >
                <Link2 className="size-4" strokeWidth={1.9} />
              </ShareLink>
            </div>

            {/* Garantías. La del envío depende de lo que haya en el panel. */}
            <ul className="mt-8 grid gap-2.5 rounded-[1.75rem] bg-white/58 p-5 ring-1 ring-white/75 backdrop-blur-md sm:grid-cols-3">
              {(settings.deliveryTime || settings.shippingZone) && (
                <Assurance
                  icon={Truck}
                  title={
                    settings.deliveryTime
                      ? `Envío en ${settings.deliveryTime}`
                      : "Envío a domicilio"
                  }
                >
                  {settings.shippingZone || "Coordinamos la entrega contigo"}
                </Assurance>
              )}
              <Assurance icon={ShieldCheck} title="100% original">
                Sellado y garantizado
              </Assurance>
            </ul>
          </div>

        </div>
      </div>

      {/* Detalle en pestañas: a todo el ancho para que la galería adhesiva
          no deje un vacío enorme a su lado en pantallas grandes. */}
      <div className="mt-16 md:mt-20">
        <div className="mx-auto max-w-4xl">
          <Tabs.Root defaultValue="detalles">
              <Tabs.List
                aria-label="Información del producto"
                className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-white/62 p-1.5 ring-1 ring-white/75 backdrop-blur-md"
              >
                {[
                  { value: "detalles", label: "Detalles" },
                  { value: "ingredientes", label: "Ingredientes" },
                  { value: "uso", label: "Modo de uso" },
                  { value: "envios", label: "Envíos" },
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className="shrink-0 rounded-full px-5 py-2.5 font-display text-sm text-ink-soft transition-all duration-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-soft data-[state=active]:to-lavender data-[state=active]:text-ink data-[state=active]:shadow-petal"
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <div className="mt-6 rounded-[1.75rem] bg-white/55 p-7 ring-1 ring-white/72 backdrop-blur-md">
                <Tabs.Content value="detalles" className="focus:outline-none">
                  <h2 className="font-display text-lg text-ink">Lo que lo hace especial</h2>
                  <ul className="mt-4 space-y-3">
                    {product.highlights.map((item) => (
                      <li key={item} className="flex gap-3 text-ink-soft">
                        <span
                          aria-hidden
                          className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-mint-soft text-[#3f6a61]"
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Tabs.Content>

                <Tabs.Content value="ingredientes" className="focus:outline-none">
                  <h2 className="font-display text-lg text-ink">Ingredientes</h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    {product.ingredients}
                  </p>
                  <p className="mt-4 rounded-2xl bg-cream p-4 text-xs leading-relaxed text-ink-muted">
                    Si tienes piel sensible o alguna alergia conocida, revisa la lista
                    completa antes de usar y haz una prueba en el antebrazo.
                  </p>
                </Tabs.Content>

                <Tabs.Content value="uso" className="focus:outline-none">
                  <h2 className="font-display text-lg text-ink">Cómo se usa</h2>
                  <ol className="mt-4 space-y-4">
                    {product.howTo.map((step, i) => (
                      <li key={step} className="flex gap-4">
                        <span
                          aria-hidden
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-lavender font-display text-sm text-[#7a4a5e]"
                        >
                          {i + 1}
                        </span>
                        <p className="pt-1 text-ink-soft">{step}</p>
                      </li>
                    ))}
                  </ol>
                </Tabs.Content>

                <Tabs.Content value="envios" className="focus:outline-none">
                  <h2 className="font-display text-lg text-ink">Envíos y pagos</h2>
                  <dl className="mt-4 space-y-4 text-ink-soft">
                    {(settings.shippingZone ||
                      settings.deliveryTime ||
                      settings.shippingPrice > 0) && (
                      <div>
                        <dt className="font-medium text-ink">Cobertura</dt>
                        <dd>
                          {[
                            settings.shippingZone,
                            settings.deliveryTime,
                            settings.shippingPrice > 0 &&
                              `envío ${formatCOP(settings.shippingPrice)}`,
                            settings.freeShippingFrom > 0 &&
                              `gratis desde ${formatCOP(settings.freeShippingFrom)}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                          .
                        </dd>
                      </div>
                    )}
                    {settings.shippingText && (
                      <div>
                        <dt className="font-medium text-ink">Envíos</dt>
                        <dd>{settings.shippingText}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-ink">Métodos de pago</dt>
                      <dd>
                        {settings.paymentMethods.length > 0
                          ? `${settings.paymentMethods.join(" · ")}. Te enviamos los datos al confirmar el pedido.`
                          : "Te confirmamos los medios de pago disponibles al tomar tu pedido."}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-ink">Empaque</dt>
                      <dd>
                        Todo va con papel de seda y sticker de marca. Si es regalo,
                        súmale tarjeta escrita a mano sin costo.
                      </dd>
                    </div>
                  </dl>
                </Tabs.Content>
              </div>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}

function SecondaryAction({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all duration-500 hover:-translate-y-0.5",
        active
          ? "bg-rose-mist text-[#a8556f] ring-1 ring-rose/40"
          : "bg-white/72 text-ink-soft ring-1 ring-white/80 hover:text-ink",
      )}
    >
      {children}
      {label}
    </button>
  );
}

function ShareLink({
  children,
  href,
  label,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full bg-white/72 text-ink-soft ring-1 ring-white/80 transition-all duration-500 hover:-translate-y-0.5 hover:bg-white hover:text-ink"
    >
      {children}
    </a>
  );
}

function Assurance({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Truck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-rose" strokeWidth={1.8} />
      <span>
        <span className="block font-display text-sm text-ink">{title}</span>
        <span className="block text-xs text-ink-soft">{children}</span>
      </span>
    </li>
  );
}

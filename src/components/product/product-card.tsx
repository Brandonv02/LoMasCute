"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart, Scale, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, discountPercent, formatCOP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Tilt } from "@/components/motion/parallax";
import { QuickView } from "@/components/product/quick-view";

/**
 * Card de producto. Tres capas de interacción, todas suaves:
 * la card se levanta, el arte gira ligerísimo en 3D siguiendo el cursor,
 * y las acciones aparecen desde abajo. En táctil las acciones son visibles
 * siempre, porque ahí no existe el hover.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { addToCart, toggleFavorite, isFavorite, toggleCompare, isComparing } = useStore();
  const [quickOpen, setQuickOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const fav = isFavorite(product.slug);
  const comparing = isComparing(product.slug);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock === 0;

  const badges = [
    soldOut && (
      <Badge key="soldout" tone="cream">
        Agotado
      </Badge>
    ),
    discount > 0 && (
      <Badge key="off" tone="rose">
        −{discount}%
      </Badge>
    ),
    product.isNew && (
      <Badge key="new" tone="lavender">
        Nuevo
      </Badge>
    ),
    product.isBestseller && (
      <Badge key="top" tone="gold">
        Top ventas
      </Badge>
    ),
  ].filter(Boolean);

  return (
    <>
      <article
        className={cn("group relative flex h-full flex-col", className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="card-lift relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/62 ring-1 ring-white/75 backdrop-blur-md">
          {/* Arte del producto */}
          <div className="relative aspect-4/5 overflow-hidden bg-cream-deep">
            <Link
              href={`/producto/${product.slug}`}
              className="absolute inset-0 z-10"
              aria-label={`Ver ${product.name}`}
            >
              <span className="sr-only">Ver {product.name}</span>
            </Link>

            <Tilt max={7} className="absolute inset-0">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority={priority}
                loading={priority ? undefined : "lazy"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-[1100ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                  hovered ? "scale-108 opacity-0" : "scale-100 opacity-100",
                )}
              />
              {/* Segunda vista: aparece al pasar el cursor */}
              <Image
                src={product.images[1] ?? product.images[0]}
                alt=""
                aria-hidden
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-all duration-[1100ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                  hovered ? "scale-104 opacity-100" : "scale-110 opacity-0",
                )}
              />
            </Tilt>

            {/* Etiquetas: máximo dos, por prioridad. Más de eso deja de
                comunicar y se convierte en ruido visual. */}
            <div className="pointer-events-none absolute left-3.5 top-3.5 z-20 flex flex-col items-start gap-1.5">
              {badges.slice(0, 2)}
            </div>

            {/* Favorito y comparar */}
            <div className="absolute right-3.5 top-3.5 z-20 flex flex-col gap-2">
              <IconChip
                label={fav ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
                onClick={() => toggleFavorite(product.slug)}
                active={fav}
              >
                <Heart
                  className={cn("size-4 transition-all duration-500", fav && "scale-110 fill-current")}
                  strokeWidth={1.9}
                />
              </IconChip>
              <IconChip
                label={comparing ? `Quitar ${product.name} de comparar` : `Comparar ${product.name}`}
                onClick={() => toggleCompare(product.slug)}
                active={comparing}
                className="opacity-0 transition-opacity duration-500 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
              >
                <Scale className="size-4" strokeWidth={1.9} />
              </IconChip>
            </div>

            {/* Acciones inferiores */}
            <div
              className={cn(
                "absolute inset-x-3 bottom-3 z-20 flex gap-2 transition-all duration-600 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                hovered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0 max-lg:translate-y-0 max-lg:opacity-100",
              )}
            >
              <button
                type="button"
                onClick={() => setQuickOpen(true)}
                className="btn-liquid flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/92 text-sm text-ink shadow-soft ring-1 ring-white/80 backdrop-blur-md"
              >
                <Eye className="size-4" strokeWidth={1.9} />
                Vista rápida
              </button>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => addToCart(product)}
                aria-label={`Agregar ${product.name} a la bolsa`}
                className="btn-liquid grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-soft via-rose to-lavender text-ink shadow-soft disabled:opacity-45"
              >
                <ShoppingBag className="size-4.5" strokeWidth={1.9} />
              </button>
            </div>
          </div>

          {/* Información */}
          <div className="flex flex-1 flex-col gap-1.5 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-ink-muted">
                {product.subcategory}
              </span>
              <Stars rating={product.rating} size={12} />
            </div>

            <h3 className="font-display text-lg leading-snug text-ink">
              <Link
                href={`/producto/${product.slug}`}
                className="transition-colors duration-400 hover:text-[#b3607f]"
              >
                {product.name}
              </Link>
            </h3>

            <p className="text-sm text-ink-soft">{product.tagline}</p>

            {/* Tonos disponibles */}
            {product.shades && product.shades.length > 0 && (
              <ul className="mt-1.5 flex items-center gap-1.5" aria-label="Tonos disponibles">
                {product.shades.slice(0, 5).map((shade) => (
                  <li key={shade.name}>
                    <span
                      title={shade.name}
                      className="block size-3.5 rounded-full ring-1 ring-white/90 ring-offset-1 ring-offset-white/40 transition-transform duration-400 hover:scale-125"
                      style={{ backgroundColor: shade.hex }}
                    />
                    <span className="sr-only">{shade.name}</span>
                  </li>
                ))}
                {product.shades.length > 5 && (
                  <li className="text-[0.7rem] text-ink-muted">
                    +{product.shades.length - 5}
                  </li>
                )}
              </ul>
            )}

            <div className="mt-auto flex items-end justify-between gap-2 pt-3">
              <p className="flex items-baseline gap-2">
                <span className="font-display text-xl text-ink">
                  {formatCOP(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-ink-muted line-through">
                    {formatCOP(product.compareAtPrice)}
                  </span>
                )}
              </p>
              {product.stock > 0 && product.stock <= 12 && (
                <motion.span
                  className="shrink-0 text-[0.7rem] text-[#b3607f]"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Quedan {product.stock}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </article>

      <QuickView product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}

function IconChip({
  children,
  label,
  onClick,
  active,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-white/85 shadow-petal ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:scale-110 hover:bg-white",
        active ? "text-[#d9698d]" : "text-ink-soft",
        className,
      )}
    >
      {children}
    </button>
  );
}

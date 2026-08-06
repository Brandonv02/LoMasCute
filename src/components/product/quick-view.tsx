"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, discountPercent, formatCOP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Vista rápida: comprar sin salir del listado */
export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addToCart } = useStore();
  const [shade, setShade] = useState(product.shades?.[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState(0);

  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-[140] bg-[#5b4a50]/28 backdrop-blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="glass-tint fixed left-1/2 top-1/2 z-[150] max-h-[92vh] w-[min(96vw,58rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2.25rem] shadow-float focus:outline-none"
                initial={{ opacity: 0, scale: 0.94, y: 22, filter: "blur(14px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, y: 14, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Cerrar vista rápida"
                    className="absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-white/88 text-ink shadow-petal transition-transform duration-500 hover:rotate-90"
                  >
                    <X className="size-4.5" strokeWidth={1.9} />
                  </button>
                </Dialog.Close>

                <div className="grid gap-0 md:grid-cols-2">
                  {/* Galería compacta */}
                  <div className="relative">
                    <div className="relative aspect-square overflow-hidden bg-cream-deep md:h-full md:rounded-l-[2.25rem]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={view}
                          className="absolute inset-0"
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.5, ease: EASE }}
                        >
                          <Image
                            src={product.images[view]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 96vw, 30rem"
                            className="object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>

                      <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                        {product.isNew && <Badge tone="lavender">Nuevo</Badge>}
                        {discount > 0 && <Badge tone="rose">−{discount}%</Badge>}
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                      {product.images.map((src, i) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setView(i)}
                          aria-label={`Ver imagen ${i + 1}`}
                          aria-current={i === view}
                          className={cn(
                            "h-2 rounded-full bg-white/80 shadow-petal transition-all duration-500",
                            i === view ? "w-7 bg-white" : "w-2 hover:w-4",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Detalle */}
                  <div className="flex flex-col p-7 md:p-9">
                    <Dialog.Title className="font-display text-2xl leading-tight text-ink md:text-3xl">
                      {product.name}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-ink-soft">{product.tagline}</p>

                    {product.reviewsCount > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <Stars rating={product.rating} showValue />
                        <span className="text-sm text-ink-soft">
                          ({product.reviewsCount} opiniones)
                        </span>
                      </div>
                    )}

                    <p className="mt-5 flex items-baseline gap-3">
                      <span className="font-display text-3xl text-ink">
                        {formatCOP(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-base text-ink-muted line-through">
                          {formatCOP(product.compareAtPrice)}
                        </span>
                      )}
                    </p>

                    <Dialog.Description className="mt-4 line-clamp-4 leading-relaxed text-ink-soft">
                      {product.description}
                    </Dialog.Description>

                    {/* Tonos */}
                    {product.shades && (
                      <div className="mt-6">
                        <p className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
                          Tono · <span className="normal-case tracking-normal text-ink">{shade}</span>
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2.5">
                          {product.shades.map((s) => (
                            <li key={s.name}>
                              <button
                                type="button"
                                onClick={() => setShade(s.name)}
                                aria-label={`Tono ${s.name}`}
                                aria-pressed={shade === s.name}
                                className={cn(
                                  "grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-white/60 transition-all duration-500",
                                  shade === s.name
                                    ? "scale-110 ring-2 ring-ink/25"
                                    : "ring-1 ring-white/80 hover:scale-110",
                                )}
                                style={{ backgroundColor: s.hex }}
                              >
                                {shade === s.name && (
                                  <Check className="size-4 text-ink/70" strokeWidth={2.4} />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cantidad + agregar */}
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 rounded-full bg-white/80 p-1 ring-1 ring-rose/25">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          aria-label="Quitar una unidad"
                          className="grid size-9 place-items-center rounded-full text-ink transition-colors duration-400 hover:bg-rose-soft"
                        >
                          <Minus className="size-4" strokeWidth={2.2} />
                        </button>
                        <span className="w-8 text-center font-medium text-ink" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          aria-label="Agregar una unidad"
                          className="grid size-9 place-items-center rounded-full text-ink transition-colors duration-400 hover:bg-rose-soft"
                        >
                          <Plus className="size-4" strokeWidth={2.2} />
                        </button>
                      </div>

                      <Button
                        size="lg"
                        className="flex-1"
                        disabled={product.stock === 0}
                        onClick={() => {
                          addToCart(product, { shade, quantity });
                          onOpenChange(false);
                        }}
                      >
                        <ShoppingBag className="size-4.5" strokeWidth={1.9} />
                        Agregar a la bolsa
                      </Button>
                    </div>

                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="mt-5 text-center text-sm text-ink-soft underline decoration-rose/50 underline-offset-4 transition-colors hover:text-ink"
                    >
                      Ver todos los detalles del producto
                    </Link>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { activeZone, site, whatsappLink } from "@/config/site";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/social-icons";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    lines,
    lineKey,
    setQuantity,
    removeLine,
    subtotal,
    shipping,
    total,
    freeShippingGap,
    count,
  } = useStore();

  const progress = Math.min(100, (subtotal / activeZone.freeFrom) * 100);

  const whatsappMessage = `¡Hola ${site.name}! 🌸 Quiero pedir:\n\n${lines
    .map(
      (l) =>
        `• ${l.quantity} × ${l.name}${l.shade ? ` (${l.shade})` : ""} — ${formatCOP(
          l.price * l.quantity,
        )}`,
    )
    .join("\n")}\n\nSubtotal: ${formatCOP(subtotal)}`;

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-label="Tu bolsa de compras"
        >
          <button
            type="button"
            aria-label="Cerrar bolsa"
            onClick={closeCart}
            className="absolute inset-0 bg-[#5b4a50]/25 backdrop-blur-md"
          />

          <motion.aside
            className="glass-tint absolute inset-y-0 right-0 flex w-[min(94vw,27rem)] flex-col rounded-l-[2.5rem] shadow-float"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            {/* Encabezado */}
            <header className="flex items-center justify-between px-7 pb-4 pt-7">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
                  Tu bolsa
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-sm text-ink-soft">
                    {count}
                  </span>
                </h2>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {count === 0 ? "Todavía está vacía" : "Todo listo para envolver"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar bolsa"
                className="grid size-10 place-items-center rounded-full bg-white/80 text-ink transition-transform duration-500 hover:rotate-90"
              >
                <X className="size-4.5" strokeWidth={1.8} />
              </button>
            </header>

            {/* Progreso de envío gratis */}
            {count > 0 && (
              <div className="mx-7 mb-2 rounded-3xl bg-white/70 p-4 ring-1 ring-white/80">
                <p className="flex items-center gap-2 text-sm text-ink">
                  <Truck className="size-4 shrink-0 text-mint" strokeWidth={1.9} />
                  {freeShippingGap > 0 ? (
                    <span>
                      Te faltan{" "}
                      <strong className="font-semibold">{formatCOP(freeShippingGap)}</strong>{" "}
                      para el envío gratis
                    </span>
                  ) : (
                    <span className="font-medium">¡Tienes envío gratis! 🎉</span>
                  )}
                </p>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-rose-mist">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-mint via-rose to-lavender"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                </div>
              </div>
            )}

            {/* Líneas */}
            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-3">
              {count === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => {
                      const key = lineKey(line);
                      return (
                        <motion.li
                          key={key}
                          layout
                          initial={{ opacity: 0, x: 30, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="group flex gap-3.5 overflow-hidden rounded-3xl bg-white/72 p-3 ring-1 ring-white/80 transition-shadow duration-500 hover:shadow-soft"
                        >
                          <Link
                            href={`/producto/${line.slug}`}
                            onClick={closeCart}
                            className="relative size-[5.25rem] shrink-0 overflow-hidden rounded-2xl bg-cream-deep"
                          >
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              sizes="84px"
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={`/producto/${line.slug}`}
                                  onClick={closeCart}
                                  className="line-clamp-2 font-display text-[0.95rem] leading-tight text-ink hover:underline"
                                >
                                  {line.name}
                                </Link>
                                {line.shade && (
                                  <p className="mt-0.5 text-xs text-ink-soft">{line.shade}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeLine(key)}
                                aria-label={`Quitar ${line.name}`}
                                className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-400 hover:bg-rose-mist hover:text-[#b3607f]"
                              >
                                <Trash2 className="size-3.5" strokeWidth={1.9} />
                              </button>
                            </div>

                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <div className="flex items-center gap-0.5 rounded-full bg-cream p-0.5 ring-1 ring-rose/25">
                                <QtyButton
                                  label="Quitar una unidad"
                                  onClick={() => setQuantity(key, line.quantity - 1)}
                                >
                                  <Minus className="size-3.5" strokeWidth={2.2} />
                                </QtyButton>
                                <span
                                  className="w-7 text-center text-sm font-medium text-ink"
                                  aria-live="polite"
                                >
                                  {line.quantity}
                                </span>
                                <QtyButton
                                  label="Agregar una unidad"
                                  disabled={line.quantity >= line.stock}
                                  onClick={() => setQuantity(key, line.quantity + 1)}
                                >
                                  <Plus className="size-3.5" strokeWidth={2.2} />
                                </QtyButton>
                              </div>
                              <p className="font-display text-[0.95rem] text-ink">
                                {formatCOP(line.price * line.quantity)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Resumen */}
            {count > 0 && (
              <footer className="border-t border-rose/20 bg-white/55 px-7 pb-7 pt-5 backdrop-blur-xl">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <dt>Subtotal</dt>
                    <dd className="text-ink">{formatCOP(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <dt>Envío · {activeZone.label}</dt>
                    <dd className={shipping === 0 ? "font-medium text-[#4a7a6d]" : "text-ink"}>
                      {shipping === 0 ? "Gratis" : formatCOP(shipping)}
                    </dd>
                  </div>
                  <div className="rule-pastel my-2.5" />
                  <div className="flex items-baseline justify-between">
                    <dt className="font-display text-lg text-ink">Total</dt>
                    <dd className="font-display text-2xl text-ink">{formatCOP(total)}</dd>
                  </div>
                </dl>

                <div className="mt-5 space-y-2.5">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/checkout" onClick={closeCart}>
                      Continuar compra
                    </Link>
                  </Button>
                  <Button asChild variant="mint" size="md" className="w-full">
                    <a
                      href={whatsappLink(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsappIcon className="size-4" />
                      Pedir por WhatsApp
                    </a>
                  </Button>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full py-1 text-center text-sm text-ink-soft underline decoration-rose/50 underline-offset-4 transition-colors hover:text-ink"
                  >
                    Seguir viendo cosas lindas
                  </button>
                </div>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QtyButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-7 place-items-center rounded-full text-ink transition-all duration-400 hover:bg-rose-soft disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <motion.div
        className="relative grid size-28 place-items-center rounded-full bg-white/75 shadow-soft ring-1 ring-white/80"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShoppingBag className="size-10 text-rose" strokeWidth={1.5} />
        <span className="absolute -right-1 -top-1 text-2xl" aria-hidden>
          ✨
        </span>
      </motion.div>
      <h3 className="mt-6 font-display text-xl text-ink">Tu bolsa está vacía</h3>
      <p className="mt-2 max-w-[16rem] text-sm text-ink-soft">
        Pero eso se arregla rapidito. Tenemos cosas muy lindas esperándote.
      </p>
      <Button asChild size="md" className="mt-6">
        <Link href="/tienda" onClick={onClose}>
          Explorar la tienda
        </Link>
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { fetchBestsellers, fetchProductsBySlugs } from "@/app/actions/catalog";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/sections/product-rail";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { formatCOP, pluralize } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FavoritesList() {
  const { favorites, ready, addToCart, toggleFavorite } = useStore();

  // Los slugs viven en localStorage: el servidor no puede saber cuáles son
  // hasta que el navegador se los dice.
  const [items, setItems] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void fetchProductsBySlugs(favorites).then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, [favorites, ready]);

  useEffect(() => {
    void fetchBestsellers().then(setSuggestions);
  }, []);

  const total = items.reduce((sum, p) => sum + p.price, 0);

  if (!ready || !loaded) {
    return (
      <div className="container-cute">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[2rem] bg-white/55 ring-1 ring-white/70"
            >
              <div className="aspect-4/5 rounded-t-[2rem] bg-cream-deep" />
              <div className="h-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-cute">
        <div className="mx-auto max-w-lg rounded-[2.5rem] bg-white/62 p-12 text-center ring-1 ring-white/75 backdrop-blur-md">
          <motion.span
            className="inline-grid size-24 place-items-center rounded-full bg-rose-mist text-rose"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="size-10" strokeWidth={1.6} />
          </motion.span>
          <h2 className="mt-6 font-display text-2xl text-ink">
            Todavía no has guardado nada
          </h2>
          <p className="mt-2.5 leading-relaxed text-ink-soft">
            Toca el corazoncito en cualquier producto para guardarlo aquí y
            decidir después con calma.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/tienda">Explorar la tienda</Link>
          </Button>
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="Para empezar"
            title="Lo que más"
            highlight="aman"
            align="center"
          />
          <div className="mt-12">
            <ProductRail products={suggestions} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-cute">
      {/* Acciones sobre la lista */}
      <div className="glass mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] p-5">
        <p className="text-sm text-ink-soft">
          <strong className="font-semibold text-ink">{items.length}</strong>{" "}
          {pluralize(items.length, "producto guardado", "productos guardados")} ·
          valor total{" "}
          <strong className="font-semibold text-ink">{formatCOP(total)}</strong>
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => items.forEach((product) => addToCart(product))}
          >
            <ShoppingBag className="size-4" strokeWidth={1.9} />
            Agregar todo a la bolsa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => items.forEach((product) => toggleFavorite(product.slug))}
          >
            <Trash2 className="size-4" strokeWidth={1.9} />
            Vaciar lista
          </Button>
        </div>
      </div>

      <motion.ul layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((product, i) => (
            <motion.li
              key={product.id}
              layout
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
            >
              <ProductCard product={product} className="h-full" priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

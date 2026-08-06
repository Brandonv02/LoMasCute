"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Scale, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { fetchBestsellers, fetchProductsBySlugs } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductRail } from "@/components/sections/product-rail";
import { formatCOP } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Comparador lado a lado: hasta 3 productos, con scroll horizontal en móvil */
export function CompareTable() {
  const { compare, ready, toggleCompare, clearCompare, addToCart } = useStore();

  const [items, setItems] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void fetchProductsBySlugs(compare).then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, [compare, ready]);

  useEffect(() => {
    void fetchBestsellers().then(setSuggestions);
  }, []);

  if (!ready || !loaded) return null;

  if (items.length === 0) {
    return (
      <div className="container-cute">
        <div className="mx-auto max-w-lg rounded-[2.5rem] bg-white/62 p-12 text-center ring-1 ring-white/75 backdrop-blur-md">
          <motion.span
            className="inline-grid size-24 place-items-center rounded-full bg-lavender-soft text-[#5e4b86]"
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Scale className="size-10" strokeWidth={1.6} />
          </motion.span>
          <h2 className="mt-6 font-display text-2xl text-ink">
            No has puesto nada a comparar
          </h2>
          <p className="mt-2.5 leading-relaxed text-ink-soft">
            En cada producto encuentras el ícono de la balanza. Agrega hasta tres
            y los ponemos lado a lado.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/tienda">Ir a la tienda</Link>
          </Button>
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="Sugerencias"
            title="Empieza"
            highlight="por aquí"
            align="center"
          />
          <div className="mt-12">
            <ProductRail products={suggestions.slice(0, 8)} />
          </div>
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Precio", render: (p: (typeof items)[number]) => (
      <span className="font-display text-xl text-ink">{formatCOP(p.price)}</span>
    ) },
    { label: "Calificación", render: (p: (typeof items)[number]) =>
      p.reviewsCount > 0 ? (
        <span className="flex flex-col gap-1">
          <Stars rating={p.rating} size={14} />
          <span className="text-xs text-ink-soft">{p.reviewsCount} opiniones</span>
        </span>
      ) : (
        <span className="text-ink-muted">Sin opiniones</span>
      ) },
    { label: "Categoría", render: (p: (typeof items)[number]) => (
      <span className="text-ink-soft">{p.subcategory}</span>
    ) },
    { label: "Presentación", render: (p: (typeof items)[number]) => (
      <span className="text-ink-soft">{p.tagline}</span>
    ) },
    { label: "Tonos", render: (p: (typeof items)[number]) =>
      p.shades ? (
        <span className="flex flex-wrap gap-1.5">
          {p.shades.map((s) => (
            <span
              key={s.name}
              title={s.name}
              className="size-4 rounded-full ring-1 ring-white/90"
              style={{ backgroundColor: s.hex }}
            />
          ))}
        </span>
      ) : (
        <Minus className="size-4 text-ink-muted" strokeWidth={2} />
      ) },
    { label: "Disponibilidad", render: (p: (typeof items)[number]) => (
      <span className={p.stock > 0 ? "text-[#3f6a61]" : "text-[#b3607f]"}>
        {p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}
      </span>
    ) },
    { label: "Lo mejor", render: (p: (typeof items)[number]) => (
      <ul className="space-y-1.5">
        {p.highlights.slice(0, 3).map((h) => (
          <li key={h} className="flex gap-2 text-sm text-ink-soft">
            <Check className="mt-0.5 size-3.5 shrink-0 text-mint" strokeWidth={2.6} />
            {h}
          </li>
        ))}
      </ul>
    ) },
  ];

  return (
    <div className="container-cute">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          Comparando{" "}
          <strong className="font-semibold text-ink">{items.length}</strong> de 3
          productos
        </p>
        <Button size="sm" variant="outline" onClick={clearCompare}>
          <X className="size-4" strokeWidth={2} />
          Limpiar comparación
        </Button>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
        <div
          className="grid min-w-[42rem] gap-4"
          style={{ gridTemplateColumns: `9rem repeat(${items.length}, minmax(13rem, 1fr))` }}
        >
          {/* Cabecera */}
          <div aria-hidden />
          <AnimatePresence mode="popLayout">
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative rounded-[1.75rem] bg-white/68 p-4 ring-1 ring-white/78 backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => toggleCompare(product.slug)}
                  aria-label={`Quitar ${product.name} de la comparación`}
                  className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 text-ink-soft shadow-petal transition-transform duration-500 hover:rotate-90 hover:text-ink"
                >
                  <X className="size-3.5" strokeWidth={2.2} />
                </button>

                <Link
                  href={`/producto/${product.slug}`}
                  className="group relative block aspect-square overflow-hidden rounded-2xl bg-cream-deep"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-108"
                  />
                </Link>

                <Link
                  href={`/producto/${product.slug}`}
                  className="mt-3.5 block font-display text-[0.95rem] leading-snug text-ink hover:underline"
                >
                  {product.name}
                </Link>

                <Button
                  size="sm"
                  className="mt-4 w-full"
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingBag className="size-4" strokeWidth={1.9} />
                  Agregar
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Filas */}
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <div className="flex items-start pt-5">
                <span className="font-display text-xs uppercase tracking-[0.14em] text-ink-muted">
                  {row.label}
                </span>
              </div>
              {items.map((product) => (
                <div
                  key={product.id + row.label}
                  className="border-t border-rose/20 pt-5"
                >
                  {row.render(product)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

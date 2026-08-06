"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search, X } from "lucide-react";
import { fetchSearchData } from "@/app/actions/catalog";
import type { Category } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatCOP, fuzzyScore, normalize } from "@/lib/utils";
import type { Product } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const SUGGESTIONS = ["Labial", "Gloss", "Rubor", "Serum", "Regalo", "Perfume", "Brochas"];

/**
 * Búsqueda tolerante: puntúa nombre, tono, categoría y etiquetas, y aguanta
 * acentos o letras faltantes ("labiar" encuentra "labial"). Se abre con ⌘K / Ctrl+K.
 */
function search(query: string, catalog: Product[]): Product[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return catalog
    .map((p) => {
      const haystacks: [string, number][] = [
        [p.name, 4],
        [p.tagline, 1.5],
        [p.subcategory, 2],
        [p.category, 2],
        [p.tags.join(" "), 2.5],
        [p.shades?.map((s) => s.name).join(" ") ?? "", 1.5],
        [p.description, 0.8],
      ];
      const score = haystacks.reduce(
        (acc, [text, weight]) => acc + fuzzyScore(q, text) * weight,
        0,
      );
      return { p, score };
    })
    .filter((r) => r.score > 0.4)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, 6)
    .map((r) => r.p);
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // El catálogo llega la primera vez que se abre el buscador y se queda: la
  // puntuación tolerante sigue corriendo en cliente, igual que antes.
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!searchOpen || loadedRef.current) return;
    loadedRef.current = true;
    void fetchSearchData().then((data) => {
      setCatalog(data.products);
      setCategories(data.categories);
    });
  }, [searchOpen]);

  const results = useMemo(() => search(query, catalog), [query, catalog]);

  // El atajo global (⌘K / Esc) vive en <Overlays>, que sí está siempre
  // montado; aquí solo reaccionamos a que la búsqueda se abra o se cierre.
  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 220);
      document.body.style.overflow = "hidden";
      return () => {
        window.clearTimeout(id);
        document.body.style.overflow = "";
      };
    }
    setQuery("");
    setActive(0);
  }, [searchOpen]);

  useEffect(() => setActive(0), [query]);

  const go = (slug: string) => {
    setSearchOpen(false);
    router.push(`/producto/${slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) go(results[active].slug);
      else if (query.trim()) {
        setSearchOpen(false);
        router.push(`/tienda?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en la tienda"
        >
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={() => setSearchOpen(false)}
            className="absolute inset-0 bg-[#5b4a50]/25 backdrop-blur-lg"
          />

          <motion.div
            className="glass-tint relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] shadow-float"
            initial={{ opacity: 0, y: -26, scale: 0.96, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, scale: 0.97, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center gap-3 px-6 py-5">
              <Search className="size-5 shrink-0 text-rose" strokeWidth={2} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Busca un labial, un serum, un regalo…"
                aria-label="Buscar productos"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent font-display text-lg text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Cerrar búsqueda"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-ink-soft transition-transform duration-500 hover:rotate-90"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="rule-pastel" />

            <div className="max-h-[52vh] overflow-y-auto p-4">
              {query.length < 2 ? (
                <div className="px-2 py-3">
                  <p className="mb-3 font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
                    Búsquedas populares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-full bg-white/75 px-4 py-2 text-sm text-ink-soft ring-1 ring-white/80 transition-all duration-400 hover:bg-white hover:text-ink hover:shadow-petal"
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <p className="mb-3 mt-7 font-display text-xs uppercase tracking-[0.2em] text-ink-muted">
                    Categorías
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={cat.comingSoon ? "/tienda" : `/categoria/${cat.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink transition-all duration-400 hover:bg-white hover:shadow-petal"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="text-3xl" aria-hidden>
                    🌸
                  </p>
                  <p className="mt-3 font-display text-lg text-ink">
                    No encontramos “{query}”
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Prueba con otra palabra o mira toda la tienda.
                  </p>
                  <Link
                    href="/tienda"
                    onClick={() => setSearchOpen(false)}
                    className="mt-4 inline-block text-sm text-ink underline decoration-rose decoration-2 underline-offset-4"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              ) : (
                <ul role="listbox" aria-label="Resultados">
                  {results.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(p.slug)}
                        className={`flex w-full items-center gap-4 rounded-3xl p-2.5 text-left transition-colors duration-300 ${
                          i === active ? "bg-white/85 shadow-petal" : "hover:bg-white/60"
                        }`}
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                          <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[0.95rem] text-ink">
                            {p.name}
                          </span>
                          <span className="block truncate text-sm text-ink-soft">
                            {p.subcategory} · {p.tagline}
                          </span>
                        </span>
                        <span className="shrink-0 font-display text-sm text-ink">
                          {formatCOP(p.price)}
                        </span>
                        {i === active && (
                          <CornerDownLeft
                            className="size-4 shrink-0 text-ink-muted"
                            strokeWidth={1.8}
                          />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-rose/20 bg-white/50 px-6 py-3 text-xs text-ink-muted">
              <span className="hidden sm:inline">
                Navega con ↑ ↓ · Abre con Enter · Cierra con Esc
              </span>
              <span className="sm:hidden">Toca un resultado para abrirlo</span>
              <span className="rounded-md bg-white/80 px-2 py-1 font-mono text-[0.65rem]">⌘K</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

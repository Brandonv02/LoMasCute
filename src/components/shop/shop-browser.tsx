"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { Category, CategorySlug, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn, formatCOP, fuzzyScore, normalize, pluralize } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const sortOptions = [
  { id: "relevancia", label: "Relevancia" },
  { id: "nuevo", label: "Lo más nuevo" },
  { id: "favoritos", label: "Mejor calificados" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
] as const;

type SortId = (typeof sortOptions)[number]["id"];

/**
 * Explorador de tienda: búsqueda tolerante, filtros por categoría,
 * subcategoría, precio y etiquetas, más orden. Todo vive en el cliente
 * (el catálogo es pequeño) y el estado relevante se refleja en la URL
 * para que los filtros se puedan compartir.
 */
/** Rango de precios y subcategorías reales del catálogo, calculados en servidor */
export type ShopFacets = {
  priceRange: { min: number; max: number };
  /** Taxonomía de la base: slug para filtrar, nombre para mostrar. */
  subcategories: { slug: string; name: string; category: string }[];
};

export function ShopBrowser({
  products,
  facets,
  categories,
  lockedCategory,
}: {
  products: Product[];
  facets: ShopFacets;
  /** Categorías reales del catálogo: alimentan el filtro por categoría. */
  categories: Category[];
  lockedCategory?: CategorySlug;
}) {
  const { priceRange, subcategories: allSubcategories } = facets;
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [activeCategories, setActiveCategories] = useState<string[]>(
    lockedCategory ? [lockedCategory] : [],
  );
  const [activeSubs, setActiveSubs] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [sort, setSort] = useState<SortId>((params.get("orden") as SortId) ?? "relevancia");
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // El orden viaja en la URL: enlaces como /tienda?orden=nuevo funcionan
  useEffect(() => {
    const urlSort = params.get("orden") as SortId | null;
    if (urlSort && sortOptions.some((o) => o.id === urlSort)) setSort(urlSort);
    const urlQuery = params.get("q");
    if (urlQuery !== null) setQuery(urlQuery);
  }, [params]);

  /**
   * Las subcategorías salen de la taxonomía de la base (`facets`), no del texto
   * de los productos: así se respeta el orden y el nombre que puso el panel. Se
   * acotan a las categorías filtradas y a lo que de verdad hay en la vista.
   */
  const subcategoriesForView = useMemo(() => {
    const pool = activeCategories.length
      ? products.filter((p) => activeCategories.includes(p.category))
      : products;
    const presentes = new Set(pool.map((p) => p.subcategorySlug).filter(Boolean));
    const acotadas = allSubcategories.filter(
      (sub) =>
        presentes.has(sub.slug) &&
        (!activeCategories.length || activeCategories.includes(sub.category)),
    );
    return acotadas.length ? acotadas : allSubcategories;
  }, [activeCategories, products, allSubcategories]);

  const results = useMemo(() => {
    const q = normalize(query);

    let list = products.filter((p) => {
      if (activeCategories.length && !activeCategories.includes(p.category)) return false;
      if (activeSubs.length && !activeSubs.includes(p.subcategorySlug)) return false;
      if (p.price > maxPrice) return false;
      if (onlyOffers && !p.compareAtPrice) return false;
      if (onlyStock && p.stock === 0) return false;
      return true;
    });

    if (q.length >= 2) {
      list = list
        .map((p) => ({
          p,
          score:
            fuzzyScore(q, p.name) * 4 +
            fuzzyScore(q, p.tags.join(" ")) * 2.5 +
            fuzzyScore(q, p.subcategory) * 2 +
            fuzzyScore(q, p.tagline) * 1.5 +
            fuzzyScore(q, p.description) * 0.8,
        }))
        .filter((r) => r.score > 0.4)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.p);
    }

    const sorted = [...list];
    switch (sort) {
      case "nuevo":
        sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.rating - a.rating);
        break;
      case "favoritos":
        sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      case "precio-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        if (q.length < 2) {
          sorted.sort(
            (a, b) =>
              Number(!!b.isBestseller) - Number(!!a.isBestseller) ||
              b.rating - a.rating,
          );
        }
    }
    return sorted;
  }, [products, query, activeCategories, activeSubs, maxPrice, onlyOffers, onlyStock, sort]);

  const activeFilterCount =
    (lockedCategory ? 0 : activeCategories.length) +
    activeSubs.length +
    (maxPrice < priceRange.max ? 1 : 0) +
    (onlyOffers ? 1 : 0) +
    (onlyStock ? 1 : 0);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const clearAll = () => {
    setActiveCategories(lockedCategory ? [lockedCategory] : []);
    setActiveSubs([]);
    setMaxPrice(priceRange.max);
    setOnlyOffers(false);
    setOnlyStock(false);
    setQuery("");
  };

  const changeSort = (id: SortId) => {
    setSort(id);
    const next = new URLSearchParams(params.toString());
    if (id === "relevancia") next.delete("orden");
    else next.set("orden", id);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const filterPanel = (
    <div className="space-y-8">
      {/* Categorías */}
      {!lockedCategory && categories.length > 0 && (
        <FilterGroup title="Categoría">
          <ul className="space-y-1.5">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.slug).length;
              return (
                <li key={cat.slug}>
                  <FilterCheck
                    label={cat.name}
                    count={count}
                    checked={activeCategories.includes(cat.slug)}
                    disabled={count === 0}
                    onChange={() =>
                      setActiveCategories((prev) => toggle(prev, cat.slug))
                    }
                  />
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      {/* Subcategorías: sin ninguna cargada, el grupo no existe */}
      {subcategoriesForView.length > 0 && (
        <FilterGroup title="Tipo de producto">
          <div className="flex flex-wrap gap-2">
            {subcategoriesForView.map((sub) => (
              <button
                key={`${sub.category}/${sub.slug}`}
                type="button"
                onClick={() => setActiveSubs((prev) => toggle(prev, sub.slug))}
                aria-pressed={activeSubs.includes(sub.slug)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-all duration-400",
                  activeSubs.includes(sub.slug)
                    ? "bg-gradient-to-br from-rose-soft to-rose text-[#7a4a5e] shadow-petal"
                    : "bg-white/72 text-ink-soft ring-1 ring-white/80 hover:bg-white hover:text-ink",
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Precio */}
      <FilterGroup title="Precio máximo">
        <p className="mb-4 font-display text-lg text-ink">{formatCOP(maxPrice)}</p>
        <Slider.Root
          value={[maxPrice]}
          onValueChange={([value]) => setMaxPrice(value)}
          min={priceRange.min}
          max={priceRange.max}
          step={1000}
          aria-label="Precio máximo"
          className="relative flex h-5 w-full touch-none select-none items-center"
        >
          <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-rose-mist">
            <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-mint via-rose to-lavender" />
          </Slider.Track>
          <Slider.Thumb className="block size-5 rounded-full bg-white shadow-soft ring-1 ring-rose/40 transition-transform duration-300 hover:scale-115 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose/30" />
        </Slider.Root>
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>{formatCOP(priceRange.min)}</span>
          <span>{formatCOP(priceRange.max)}</span>
        </div>
      </FilterGroup>

      {/* Extras */}
      <FilterGroup title="Otros filtros">
        <ul className="space-y-1.5">
          <li>
            <FilterCheck
              label="Solo en oferta"
              checked={onlyOffers}
              onChange={() => setOnlyOffers((v) => !v)}
            />
          </li>
          <li>
            <FilterCheck
              label="Solo disponibles"
              checked={onlyStock}
              onChange={() => setOnlyStock((v) => !v)}
            />
          </li>
        </ul>
      </FilterGroup>

      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
          <X className="size-4" strokeWidth={2} />
          Limpiar filtros ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-cute">
      {/* Barra de búsqueda y orden */}
      <div className="sticky top-24 z-30 -mx-4 mb-10 px-4 md:-mx-6 md:px-6">
        <div className="glass flex flex-wrap items-center gap-3 rounded-[1.75rem] p-3">
          {/* En móvil el buscador ocupa su propia fila: si comparte línea con
              los controles se comprime hasta volverse inservible. */}
          <div className="relative w-full min-w-0 sm:w-auto sm:flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-rose"
              strokeWidth={2}
            />
            <label htmlFor="shop-search" className="sr-only">
              Buscar en la tienda
            </label>
            <Input
              id="shop-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca un labial, un serum, un regalo…"
              className="border-transparent bg-white/70 pl-12"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-rose-mist hover:text-ink"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label htmlFor="shop-sort" className="sr-only">
              Ordenar por
            </label>
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                id="shop-sort"
                value={sort}
                onChange={(e) => changeSort(e.target.value as SortId)}
                className="h-12 w-full appearance-none rounded-2xl border border-transparent bg-white/70 pl-4 pr-10 text-sm text-ink outline-none transition-colors hover:bg-white focus:ring-4 focus:ring-rose/20 sm:w-auto"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
              >
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="relative flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-white/70 px-4 text-sm text-ink transition-colors hover:bg-white lg:hidden"
            >
              <SlidersHorizontal className="size-4" strokeWidth={2} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-rose text-[0.65rem] text-[#6b4150]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
        {/* Filtros de escritorio */}
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-48 rounded-[1.75rem] bg-white/55 p-6 ring-1 ring-white/72 backdrop-blur-md">
            {filterPanel}
          </div>
        </aside>

        {/* Resultados */}
        <div className="min-w-0">
          <p className="mb-6 text-sm text-ink-soft" aria-live="polite">
            <strong className="font-semibold text-ink">{results.length}</strong>{" "}
            {pluralize(results.length, "producto", "productos")}
            {query.length >= 2 && (
              <>
                {" "}
                para “<span className="text-ink">{query}</span>”
              </>
            )}
          </p>

          {results.length === 0 ? (
            <EmptyResults onClear={clearAll} />
          ) : (
            <motion.ul
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {results.map((product, i) => (
                  <motion.li
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.035, 0.4), ease: EASE }}
                  >
                    <ProductCard product={product} priority={i < 3} className="h-full" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      {/* Filtros en móvil */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="fixed inset-0 z-[110] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
          >
            <button
              type="button"
              aria-label="Cerrar filtros"
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 bg-[#5b4a50]/25 backdrop-blur-md"
            />
            <motion.div
              className="glass-tint absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[2.5rem] p-7 pb-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="mb-7 flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Cerrar filtros"
                  className="grid size-10 place-items-center rounded-full bg-white/85 text-ink"
                >
                  <X className="size-4.5" strokeWidth={1.9} />
                </button>
              </div>
              {filterPanel}
              <Button size="lg" className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
                Ver {results.length} {pluralize(results.length, "producto", "productos")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3.5 font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function FilterCheck({
  label,
  count,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors duration-400",
        disabled ? "cursor-not-allowed opacity-45" : "hover:bg-white/70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-lg ring-1 transition-all duration-400",
          checked
            ? "bg-gradient-to-br from-rose to-lavender ring-rose"
            : "bg-white/85 ring-rose/35",
        )}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="size-3.5 text-white">
            <path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="flex-1 text-sm text-ink-soft peer-checked:text-ink">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-ink-muted">{count}</span>
      )}
    </label>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[2rem] bg-white/62 p-14 text-center ring-1 ring-white/75 backdrop-blur-md">
      <motion.p
        className="text-4xl"
        aria-hidden
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5 }}
      >
        🌷
      </motion.p>
      <h3 className="mt-5 font-display text-2xl text-ink">
        No encontramos nada con esos filtros
      </h3>
      <p className="mx-auto mt-2.5 max-w-sm text-ink-soft">
        Prueba quitando alguno, o cuéntanos qué buscas por WhatsApp y lo
        conseguimos para ti.
      </p>
      <Button className="mt-7" onClick={onClear}>
        <Sparkles className="size-4" strokeWidth={2} />
        Ver todo de nuevo
      </Button>
    </div>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import toast from "react-hot-toast";
import type { CartLine, Product } from "@/lib/types";
import { useSiteSettings } from "@/components/site-settings-provider";
import { clamp } from "@/lib/utils";

/* ------------------------------------------------------------ persistencia */

const KEYS = {
  cart: "lmc.cart.v1",
  favorites: "lmc.favorites.v1",
  compare: "lmc.compare.v1",
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* cuota llena o modo privado: seguimos en memoria */
  }
}

/* ------------------------------------------------------------------ reducer */

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "remove"; key: string }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "clear" };

const lineKey = (line: Pick<CartLine, "productId" | "shade">) =>
  `${line.productId}::${line.shade ?? "default"}`;

function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const key = lineKey(action.line);
      const existing = state.find((l) => lineKey(l) === key);
      if (existing) {
        return state.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: clamp(l.quantity + action.line.quantity, 1, l.stock) }
            : l,
        );
      }
      return [...state, action.line];
    }
    case "remove":
      return state.filter((l) => lineKey(l) !== action.key);
    case "setQty":
      return state
        .map((l) =>
          lineKey(l) === action.key
            ? { ...l, quantity: clamp(action.quantity, 0, l.stock) }
            : l,
        )
        .filter((l) => l.quantity > 0);
    case "clear":
      return [];
  }
}

/* -------------------------------------------------------------------- store */

type StoreValue = {
  /* carrito */
  lines: CartLine[];
  lineKey: typeof lineKey;
  addToCart: (product: Product, opts?: { shade?: string; quantity?: number }) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingGap: number;
  /**
   * false cuando el panel todavía no tiene tarifa ni tope de envío gratis: el
   * carrito muestra el envío como "por confirmar" en vez de anunciar "Gratis".
   */
  shippingKnown: boolean;
  /* drawer */
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /* favoritos */
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  /* comparar */
  compare: string[];
  toggleCompare: (slug: string) => void;
  isComparing: (slug: string) => boolean;
  clearCompare: () => void;
  /* búsqueda global */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** true cuando ya leímos localStorage: evita parpadeos de hidratación */
  ready: boolean;
};

const StoreContext = createContext<StoreValue | null>(null);

const MAX_COMPARE = 3;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Las condiciones de envío son configuración de la tienda, no constantes del
  // código: el carrito calcula con lo que haya guardado el panel.
  const { shippingPrice, freeShippingFrom } = useSiteSettings();
  const [lines, dispatch] = useReducer(cartReducer, []);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hidratación desde localStorage (una sola vez, en cliente)
  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStorage<CartLine[]>(KEYS.cart, []) });
    setFavorites(readStorage<string[]>(KEYS.favorites, []));
    setCompare(readStorage<string[]>(KEYS.compare, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeStorage(KEYS.cart, lines);
  }, [lines, ready]);
  useEffect(() => {
    if (ready) writeStorage(KEYS.favorites, favorites);
  }, [favorites, ready]);
  useEffect(() => {
    if (ready) writeStorage(KEYS.compare, compare);
  }, [compare, ready]);

  const addToCart = useCallback(
    (product: Product, opts?: { shade?: string; quantity?: number }) => {
      const shade = opts?.shade ?? product.shades?.[0]?.name;
      dispatch({
        type: "add",
        line: {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          price: product.price,
          image: product.images[0],
          shade,
          quantity: clamp(opts?.quantity ?? 1, 1, product.stock),
          stock: product.stock,
        },
      });
      setCartOpen(true);
      toast.success(`${product.name} está en tu bolsa`, { id: product.id });
    },
    [],
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      toast(prev.includes(slug) ? "Quitado de favoritos" : "Guardado en favoritos", {
        icon: prev.includes(slug) ? "🤍" : "💖",
        id: `fav-${slug}`,
      });
      return next;
    });
  }, []);

  const toggleCompare = useCallback((slug: string) => {
    setCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) {
        toast("Puedes comparar hasta 3 productos", { icon: "✨", id: "cmp-max" });
        return prev;
      }
      toast("Agregado a comparar", { icon: "⚖️", id: `cmp-${slug}` });
      return [...prev, slug];
    });
  }, []);

  const value = useMemo<StoreValue>(() => {
    const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
    const freeShipping = freeShippingFrom > 0 && subtotal >= freeShippingFrom;
    const shipping = lines.length === 0 || freeShipping ? 0 : shippingPrice;
    return {
      lines,
      lineKey,
      addToCart,
      removeLine: (key) => dispatch({ type: "remove", key }),
      setQuantity: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
      clearCart: () => dispatch({ type: "clear" }),
      count: lines.reduce((a, l) => a + l.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      freeShippingGap:
        freeShippingFrom > 0 ? Math.max(0, freeShippingFrom - subtotal) : 0,
      shippingKnown: shippingPrice > 0 || freeShippingFrom > 0,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      favorites,
      toggleFavorite,
      isFavorite: (slug) => favorites.includes(slug),
      compare,
      toggleCompare,
      isComparing: (slug) => compare.includes(slug),
      clearCompare: () => setCompare([]),
      searchOpen,
      setSearchOpen,
      ready,
    };
  }, [
    lines,
    favorites,
    compare,
    cartOpen,
    searchOpen,
    ready,
    addToCart,
    toggleFavorite,
    toggleCompare,
    shippingPrice,
    freeShippingFrom,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

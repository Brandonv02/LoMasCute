"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { StoreProvider, useStore } from "@/lib/store";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/**
 * La bolsa y el buscador solo existen cuando alguien los abre. Los dos son
 * pantallas completas con diálogo, animación y —en el caso del buscador— el
 * catálogo entero para poder buscar sin red: cargarlos en el arranque es
 * pagar por adelantado algo que la mayoría de visitas no llega a usar.
 */
const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const SearchOverlay = dynamic(
  () => import("@/components/search/search-overlay").then((m) => m.SearchOverlay),
  { ssr: false },
);
const GlowCursor = dynamic(
  () => import("@/components/atmosphere/glow-cursor").then((m) => m.GlowCursor),
  { ssr: false },
);

function Overlays() {
  const { cartOpen, searchOpen, setSearchOpen } = useStore();
  const [cartReady, setCartReady] = useState(false);
  const [searchReady, setSearchReady] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (cartOpen) setCartReady(true);
  }, [cartOpen]);

  useEffect(() => {
    if (searchOpen) setSearchReady(true);
  }, [searchOpen]);

  // Atajo de teclado global: vive aquí para que ⌘K siga funcionando aunque el
  // buscador todavía no se haya montado.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  // El brillo del cursor no tiene sentido en una pantalla táctil: en móvil ni
  // se descarga. Y cuando el navegador está ocioso precargamos los diálogos,
  // para que abrirlos sea instantáneo sin haber estorbado en el arranque.
  useEffect(() => {
    setFinePointer(
      window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    const warm = () => {
      void import("@/components/cart/cart-drawer");
      void import("@/components/search/search-overlay");
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(warm, { timeout: 4000 })
      : window.setTimeout(warm, 2500);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, []);

  return (
    <>
      {finePointer && <GlowCursor />}
      {cartReady && <CartDrawer />}
      {searchReady && <SearchOverlay />}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <SmoothScroll />
      {children}
      <Overlays />
      <Toaster
        position="bottom-center"
        gutter={10}
        toastOptions={{
          duration: 2800,
          style: {
            background: "rgba(255, 251, 249, 0.92)",
            backdropFilter: "blur(18px)",
            color: "#4a4145",
            border: "1px solid rgba(248, 182, 200, 0.5)",
            borderRadius: "999px",
            padding: "0.7rem 1.15rem",
            fontSize: "0.9rem",
            boxShadow: "0 20px 45px -22px rgba(190, 136, 156, 0.5)",
          },
          success: { iconTheme: { primary: "#F8B6C8", secondary: "#FFF7F4" } },
        }}
      />
    </StoreProvider>
  );
}

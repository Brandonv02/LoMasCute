"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

/**
 * Los avisos flotantes solo aparecen después de una acción —agregar a la bolsa,
 * guardar un favorito, enviar un formulario—, así que su librería tampoco tiene
 * por qué compilarse en el arranque. Los mensajes viven en el store de
 * react-hot-toast, no en el componente: si uno se dispara justo antes de que
 * monte, se muestra igual.
 */
const Toaster = dynamic(() => import("react-hot-toast").then((m) => m.Toaster), {
  ssr: false,
});

/**
 * Primera señal de que hay alguien al otro lado: un toque, una tecla o un
 * scroll. Antes el precalentado de la bolsa y del buscador se lanzaba en el
 * primer hueco libre del navegador (~2.5 s), que en un móvil lento cae justo
 * dentro de la ventana que mide el bloqueo del hilo principal: compilar
 * framer-motion y el buscador ahí dentro costaba tiempo de bloqueo sin que
 * nadie hubiera pedido nada todavía.
 *
 * Ahora se espera a la primera intención real. Quien toca la pantalla dispara
 * la descarga antes de que su clic termine, así que abrir la bolsa se siente
 * igual que antes; y si alguien se queda leyendo sin tocar nada, el respaldo
 * la trae a los diez segundos.
 */
function useFirstIntent() {
  const [intent, setIntent] = useState(false);

  useEffect(() => {
    const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
    const options = { passive: true, capture: true } as const;
    let timer = 0;

    const fire = () => {
      setIntent(true);
      events.forEach((event) => window.removeEventListener(event, fire, options));
      window.clearTimeout(timer);
    };

    events.forEach((event) => window.addEventListener(event, fire, options));
    timer = window.setTimeout(fire, 10000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, fire, options));
      window.clearTimeout(timer);
    };
  }, []);

  return intent;
}

function Overlays({ intent }: { intent: boolean }) {
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
  // se descarga.
  useEffect(() => {
    setFinePointer(
      window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Los diálogos se precargan en cuanto hay intención, para que abrirlos siga
  // siendo instantáneo sin compilar nada durante el arranque.
  useEffect(() => {
    if (!intent) return;
    void import("@/components/cart/cart-drawer");
    void import("@/components/search/search-overlay");
  }, [intent]);

  return (
    <>
      {finePointer && <GlowCursor />}
      {cartReady && <CartDrawer />}
      {searchReady && <SearchOverlay />}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const intent = useFirstIntent();

  return (
    <StoreProvider>
      <SmoothScroll />
      {children}
      <Overlays intent={intent} />
      {intent && (
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
      )}
    </StoreProvider>
  );
}

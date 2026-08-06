"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/components/providers";

/**
 * Decide si la página que se está pintando lleva el vestido de la tienda.
 *
 * El panel de administración vive bajo /admin y no debe heredar nada de la
 * portada: ni cabecera, ni footer, ni atmósfera pastel, ni el carrito. Como el
 * layout raíz es el único sitio donde se monta ese decorado, la elección tiene
 * que ocurrir aquí.
 *
 * Los bloques llegan ya renderizados desde el servidor (`footer`, `ambient`…),
 * así que este componente solo elige cuáles pinta: los que son Server
 * Components siguen siéndolo y no se llevan JavaScript al cliente.
 */
export function StoreChrome({
  jsonLd,
  splash,
  ambient,
  header,
  footer,
  floating,
  children,
}: {
  jsonLd: React.ReactNode;
  splash: React.ReactNode;
  ambient: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  floating: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {jsonLd}

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-display focus:text-ink focus:shadow-lift"
      >
        Saltar al contenido
      </a>

      <Providers>
        {splash}
        {header}
        <main id="contenido" className="relative z-[2]">
          {children}
        </main>
        {footer}
        {floating}
        {/* La atmósfera va al final del documento a propósito.
            Sus manchas de luz están posicionadas en porcentajes del alto de la
            página, así que cuando se pintaban primero bajaban unos 130 px a
            medida que el HTML de las secciones iba llegando, y el navegador lo
            contaba como desplazamiento de diseño. Al pintarse cuando el resto
            ya está medido, aparecen directamente en su sitio. Se ven igual:
            llevan `-z-10`, que las manda detrás de todo sin importar el orden
            del documento. */}
        {ambient}
      </Providers>
    </>
  );
}

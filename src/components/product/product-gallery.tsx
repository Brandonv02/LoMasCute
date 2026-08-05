"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Expand, ZoomIn } from "lucide-react";
import { usePresence } from "@/components/motion/presence";
import { cn } from "@/lib/utils";

/**
 * Galería con zoom por posición del cursor (estilo lupa) y visor a
 * pantalla completa. En táctil el zoom se activa al tocar la imagen.
 *
 * La imagen principal es el elemento más grande de la ficha —su LCP— y antes
 * nacía con `opacity: 0` esperando a que la librería de animación se hidratara.
 * Ahora entra con una animación CSS que arranca en el primer pintado.
 */
export function ProductGallery({
  images,
  name,
  badges,
}: {
  images: string[];
  name: string;
  badges?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewer = usePresence(fullscreen, 500);

  /** Vista que se está desvaneciendo: reproduce el relevo "sale y luego entra" */
  const [leaving, setLeaving] = useState<number | null>(null);
  const previous = useRef(index);

  useEffect(() => {
    if (previous.current === index) return;
    setLeaving(previous.current);
    previous.current = index;
    const timer = window.setTimeout(() => setLeaving(null), 560);
    return () => window.clearTimeout(timer);
  }, [index]);

  const onMove = (event: React.MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <>
      <div className="lg:sticky lg:top-32">
        {/* Marco principal */}
        <div
          ref={frameRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
          className="group relative aspect-4/5 overflow-hidden rounded-[2.5rem] bg-cream-deep shadow-soft ring-1 ring-white/75"
        >
          {leaving !== null && (
            <div
              key={`out-${leaving}`}
              aria-hidden
              className="absolute inset-0"
              style={{ animation: "galleryOut 0.55s var(--ease-silk) both" }}
            >
              <Image
                src={images[leaving]}
                alt=""
                fill
                sizes="(max-width: 1024px) 96vw, 40rem"
                className="object-cover"
              />
            </div>
          )}

          <div
            key={index}
            className="absolute inset-0"
            style={{
              animation: `galleryIn 0.55s var(--ease-silk) ${
                leaving !== null ? "0.55s" : "0s"
              } both`,
            }}
          >
            <Image
              src={images[index]}
              alt={`${name} — vista ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 96vw, 40rem"
              className="object-cover transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: zoom ? "scale(1.9)" : "scale(1)",
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            />
          </div>

          {badges && (
            <div className="pointer-events-none absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
              {badges}
            </div>
          )}

          {/* Pistas de interacción */}
          <span className="pointer-events-none absolute bottom-5 left-5 z-10 flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 text-xs text-ink-soft opacity-0 shadow-petal backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100 max-lg:hidden">
            <ZoomIn className="size-3.5" strokeWidth={2} />
            Mueve el cursor para acercar
          </span>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="Ver imagen en grande"
            className="absolute bottom-5 right-5 z-10 grid size-11 place-items-center rounded-full bg-white/88 text-ink shadow-soft backdrop-blur-md transition-all duration-500 hover:scale-110"
          >
            <Expand className="size-4.5" strokeWidth={1.9} />
          </button>
        </div>

        {/* Miniaturas */}
        <ul className="mt-4 flex gap-3" aria-label="Vistas del producto">
          {images.map((src, i) => (
            <li key={src} className="flex-1">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver vista ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-3xl bg-cream-deep transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                  i === index
                    ? "ring-2 ring-rose ring-offset-2 ring-offset-cream"
                    : "opacity-65 ring-1 ring-white/70 hover:-translate-y-1 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="140px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Visor a pantalla completa */}
      {viewer.mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[160] grid place-items-center p-4 transition-opacity duration-300",
            viewer.shown ? "opacity-100" : "opacity-0",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} en pantalla completa`}
        >
          <button
            type="button"
            aria-label="Cerrar visor"
            onClick={() => setFullscreen(false)}
            className="absolute inset-0 bg-cream/92 backdrop-blur-xl"
          />
          <div
            className={cn(
              "relative aspect-4/5 w-full max-w-3xl overflow-hidden rounded-[2.5rem] shadow-float ring-1 ring-white/70 transition-all duration-500 [transition-timing-function:var(--ease-silk)]",
              viewer.shown ? "scale-100 opacity-100" : "scale-92 opacity-0",
            )}
          >
            <Image
              src={images[index]}
              alt={`${name} — vista ${index + 1}`}
              fill
              sizes="(max-width: 768px) 96vw, 48rem"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver vista ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full bg-rose/40 transition-all duration-500",
                  i === index ? "w-8 bg-rose" : "w-2.5 hover:w-5",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

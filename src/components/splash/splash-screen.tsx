"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/components/site-settings-provider";
import { storeLabel } from "@/lib/site-settings";
import { Heart, Flower, Sparkle } from "@/components/atmosphere/ambient";

const KEY = "lmc.splash.seen";

/**
 * Bienvenida de marca: el logo llega con blur-reveal, los pétalos se abren y
 * una cortina de crema sube para entregar el hero.
 *
 * Se muestra una sola vez por navegador: la marca vive en localStorage, así
 * que quien vuelve mañana entra directo a la tienda y solo la recupera si
 * borra los datos del navegador. Quien llega desde Google a una ficha de
 * producto entra directo al contenido — la intro sería un muro entre esa
 * persona y lo que vino a ver. Si pidió menos movimiento, no se muestra nunca.
 *
 * La animación es CSS pura: en la primera visita, que es la más cara, no
 * descargamos ni ejecutamos una librería de animación para tapar la pantalla.
 *
 * ── Duración ──────────────────────────────────────────────────────────────
 * La secuencia completa dura 800 ms (antes 3800 ms). Los tiempos no se
 * escalaron todos por igual: tapar la pantalla es lo que Lighthouse mide como
 * contenido visible, así que el tiempo se reparte donde se nota.
 *
 *   0 →  50 ms  bruma y anillo entran
 *  50 → 300 ms  logo con blur-reveal (es el protagonista: se queda con el
 *               tramo más largo, 250 ms, para no sentirse atropellado)
 * 130 → 310 ms  eslogan y barra, escalonados detrás del logo
 *  50 → 380 ms  los doce pétalos se abren en cascada
 * 380 → 690 ms  la cortina sube
 * 620 → 780 ms  la pantalla se desvanece tras la cortina
 *        800 ms  se desmonta
 *
 * Cada bloque conserva su curva (`--ease-silk`, `linear` en el anillo), su
 * orden y su solape con el siguiente; lo único que cambia es la escala de
 * tiempo, con la proporción salida/entrada del original (1300/2500).
 */

/** Sostenido de la intro: cuando arranca la salida. */
const HOLD_MS = 380;
/** Vida total: sostenido + cortina + desvanecido. */
const TOTAL_MS = 800;
export function SplashScreen() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const [phase, setPhase] = useState<"idle" | "on" | "out">("idle");
  /**
   * La barra avanza escribiendo su ancho en el nodo, no por estado.
   *
   * Con `useState` cada paso del contador reconciliaba toda la bienvenida
   * —logo, anillo de pétalos y halo— veintidós veces justo en la ventana en la
   * que el navegador está hidratando la página. El salto y el ritmo son
   * exactamente los mismos; lo que desaparece es el trabajo de React.
   */
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(KEY);
    } catch {
      /* modo privado o almacenamiento bloqueado: mejor no insistir */
      seen = "1";
    }
    const wantsCalm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || wantsCalm) return;

    // Se marca al mostrarla, no al terminarla: si alguien navega a mitad de la
    // intro, tampoco debería volver a verla.
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* sin persistencia: se comporta como antes */
    }

    setPhase("on");
    document.documentElement.style.overflow = "hidden";

    // Mismo gesto de antes —saltos irregulares hasta llenarse— en la misma
    // proporción del sostenido: llegaba al 100% en torno al 40% de la intro.
    let progress = 0;
    const ticker = window.setInterval(() => {
      progress = Math.min(100, progress + 12 + Math.random() * 24);
      if (barRef.current) barRef.current.style.width = `${progress}%`;
    }, 40);
    const leaving = window.setTimeout(() => {
      setPhase("out");
      document.documentElement.style.overflow = "";
    }, HOLD_MS);
    // 0.24s de espera + 0.16s de desvanecido: cuando acaba, ya no pinta nada.
    const gone = window.setTimeout(() => setPhase("idle"), TOTAL_MS);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(leaving);
      window.clearTimeout(gone);
      document.documentElement.style.overflow = "";
    };
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div
      className={`splash fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-cream ${
        phase === "out" ? "is-leaving" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Cargando ${storeLabel(settings)}`}
    >
      {/* Bruma pastel que respira */}
      <div
        aria-hidden
        className="cute-in absolute inset-0"
        style={
          {
            "--in-scale": "1.25",
            "--in-duration": "0.32s",
          } as React.CSSProperties
        }
      >
        <div className="absolute left-1/2 top-1/2 size-[130vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,214,226,0.85),rgba(255,247,244,0)_62%)]" />
        <div className="absolute -left-[10%] top-[12%] size-[52vmax] rounded-full bg-[radial-gradient(circle,rgba(220,206,245,0.6),transparent_66%)] blur-[70px]" />
        <div className="absolute -right-[8%] bottom-[6%] size-[46vmax] rounded-full bg-[radial-gradient(circle,rgba(191,220,213,0.55),transparent_66%)] blur-[70px]" />
      </div>

      {/* Anillo de pétalos girando */}
      <div
        aria-hidden
        className="absolute size-[min(78vmin,560px)]"
        style={{ animation: "splashRing 0.46s linear both" }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const Shape = i % 3 === 0 ? Heart : i % 3 === 1 ? Flower : Sparkle;
          const tones = ["text-rose", "text-lavender", "text-mint", "text-gold", "text-peach"];
          return (
            <span
              key={i}
              className={`absolute left-1/2 top-1/2 ${tones[i % tones.length]}`}
              style={
                {
                  "--px": `${Math.cos(angle) * 44}%`,
                  "--py": `${Math.sin(angle) * 44}%`,
                  // Misma cascada: doce pétalos escalonados, el último cierra
                  // justo cuando arranca la cortina.
                  animation: `splashPetal 0.24s var(--ease-silk) ${0.05 + i * 0.008}s both`,
                } as React.CSSProperties
              }
            >
              <Shape className="size-5 md:size-7" />
            </span>
          );
        })}
      </div>

      {/* Logo con blur reveal */}
      <div className="relative z-10 flex flex-col items-center px-8">
        <div
          className="cute-in relative"
          style={
            {
              "--in-y": "22px",
              "--in-scale": "0.82",
              "--in-blur": "26px",
              // El tramo más generoso de la intro: el blur-reveal del logo es
              // lo que se mira, así que se lleva 250 de los 380 ms.
              "--in-duration": "0.25s",
              "--in-delay": "0.05s",
            } as React.CSSProperties
          }
        >
          <div
            aria-hidden
            className="absolute inset-[-22%] rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.6),transparent_66%)] blur-3xl"
            style={{ animation: "splashHalo 0.5s var(--ease-silk) infinite" }}
          />
          <Image
            src="/brand/logo-lo-mas-cute.png"
            alt={storeLabel(settings)}
            width={520}
            height={520}
            priority
            sizes="(max-width: 768px) 78vw, 520px"
            className="w-[min(74vw,430px)] drop-shadow-[0_20px_50px_rgba(214,158,176,0.35)]"
          />
        </div>

        {settings.tagline && (
          <p
            className="cute-in mt-2 text-center font-display text-base tracking-[0.28em] text-ink-soft uppercase md:text-lg"
            style={
              {
                "--in-y": "16px",
                "--in-blur": "10px",
                // Entra escalonado detrás del logo, como antes.
                "--in-duration": "0.18s",
                "--in-delay": "0.13s",
              } as React.CSSProperties
            }
          >
            {settings.tagline}
          </p>
        )}

        {/* Barra de carga con brillo */}
        <div
          className="shine relative mt-9 h-[5px] w-52 overflow-hidden rounded-full bg-white/70 ring-1 ring-rose/30"
          style={{ animation: "splashBar 0.15s var(--ease-silk) 0.15s both" }}
        >
          <span
            ref={barRef}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-soft via-rose to-lavender transition-[width] duration-400 ease-out"
            style={{ width: 0 }}
          />
        </div>
      </div>

      {/* Cortina: se abre y entrega la página. Mide el doble de la pantalla y
          espera justo debajo; sube con transform, así que el arco es el mismo
          pero el navegador no recalcula el diseño en cada fotograma. */}
      <span
        aria-hidden
        className="splash-curtain absolute inset-x-0 top-full z-20 h-[200%] bg-cream"
        style={{ borderTopLeftRadius: "50% 90px", borderTopRightRadius: "50% 90px" }}
      />
    </div>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { Twinkles } from "@/components/atmosphere/ambient";
import { cn } from "@/lib/utils";

/** Cabecera común de páginas internas, con miga de pan */
export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  breadcrumbs,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  breadcrumbs?: { name: string; href: string }[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden pb-12 pt-14 md:pb-16 md:pt-20", className)}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_-30%,#FFFFFF,transparent_62%)]" />
        <div className="absolute -left-[8%] top-[-30%] size-[38vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgba(252,214,226,0.65),transparent_66%)] blur-[70px]" />
        <div className="absolute -right-[6%] top-[-20%] size-[32vmax] animate-drift rounded-full bg-[radial-gradient(circle,rgba(220,206,245,0.55),transparent_66%)] blur-[70px] [animation-delay:-7s]" />
      </div>
      <Twinkles count={9} />

      <div className="container-cute">
        {breadcrumbs && (
          <Reveal kind="fade" duration={0.6}>
            <nav aria-label="Ruta de navegación">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
                {breadcrumbs.map((crumb, i) => {
                  const last = i === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.href} className="flex items-center gap-1">
                      {last ? (
                        <span aria-current="page" className="text-ink">
                          {crumb.name}
                        </span>
                      ) : (
                        <>
                          <Link
                            href={crumb.href}
                            className="underline decoration-rose/40 underline-offset-4 transition-colors hover:text-ink"
                          >
                            {crumb.name}
                          </Link>
                          <ChevronRight
                            aria-hidden
                            className="size-3.5 text-ink-muted"
                            strokeWidth={2}
                          />
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </Reveal>
        )}

        <div className="mt-6 max-w-3xl">
          {eyebrow && (
            <Reveal kind="up" duration={0.7}>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
          )}
          <Reveal kind="blur" delay={0.08}>
            <h1 className="mt-5 font-display text-[2.3rem] leading-[1.06] md:text-[3.4rem]">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="text-gradient">{highlight}</span>
                </>
              )}
            </h1>
          </Reveal>
          {description && (
            <Reveal kind="up" delay={0.16}>
              <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
                {description}
              </p>
            </Reveal>
          )}
        </div>

        {children}
      </div>
    </header>
  );
}

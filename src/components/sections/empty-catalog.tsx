import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PetalDivider } from "@/components/atmosphere/ambient";
import { cn } from "@/lib/utils";

/**
 * Qué se ve cuando no hay productos que mostrar.
 *
 * Puede pasar por tres motivos igual de legítimos: el catálogo todavía no se ha
 * cargado, una categoría está anunciada pero sin surtir, o unos filtros no
 * encontraron nada. En los tres casos la tienda tiene que seguir sintiéndose
 * cuidada: nada de una tabla vacía ni un "sin resultados" a secas.
 */
export function EmptyCatalog({
  title,
  description,
  action,
  className,
  compact = false,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grain relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/70 via-rose-mist/60 to-lavender-soft/60 text-center shadow-soft ring-1 ring-white/80 backdrop-blur-md",
        compact ? "px-8 py-12" : "px-8 py-16 md:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 size-56 animate-drift decor-loop rounded-full bg-[radial-gradient(circle,rgba(248,182,200,0.45),transparent_68%)] blur-2xl"
      />

      <PetalDivider className="relative mx-auto max-w-xs" />

      <h3
        className={cn(
          "relative mt-5 font-display leading-tight text-ink",
          compact ? "text-xl" : "text-2xl md:text-[2rem]",
        )}
      >
        {title}
      </h3>
      <p className="relative mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        {description}
      </p>

      {action && (
        <div className="relative mt-7">
          <Button asChild size="lg" variant="cream">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

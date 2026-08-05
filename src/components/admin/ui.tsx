import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Piezas reutilizables del panel. Todas son Server Components: son marcado y
 * color, no comportamiento, así que no tienen por qué costar JavaScript.
 */

export type Tone = "rose" | "mint" | "lavender" | "peach" | "gold" | "neutral";

/* ------------------------------------------------------------------ panel */

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("admin-panel overflow-hidden", padded && "p-6", className)}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="admin-title text-lg">{title}</h2>
        {description && <p className="admin-soft mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/* ----------------------------------------------------------- encabezado */

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="admin-in flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1 className="admin-title mt-2 text-[1.9rem] leading-tight md:text-[2.3rem]">
          {title}
        </h1>
        {description && (
          <p className="admin-soft mt-2 max-w-2xl text-[0.95rem] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* --------------------------------------------------------------- pastillas */

export function StatusPill({
  children,
  tone = "neutral",
  plain = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  plain?: boolean;
}) {
  return (
    <span className={cn("admin-pill", plain && "admin-pill-plain", `tone-${tone}`)}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- indicadores */

/** Línea de tendencia mínima, dibujada en SVG desde el servidor */
export function Sparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);
  const path = points
    .map((value, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(28 - ((value - min) / span) * 24).toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("h-8 w-full", className)}
    >
      <defs>
        <linearGradient id={`spark-${points.join("-")}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#F8B6C8" />
          <stop offset="1" stopColor="#DCCEF5" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L100,32 L0,32 Z`}
        fill={`url(#spark-${points.join("-")})`}
        opacity="0.22"
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#spark-${points.join("-")})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  tone = "rose",
  trend,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  icon: LucideIcon;
  tone?: Tone;
  trend?: number[];
  delay?: number;
}) {
  const up = (delta ?? 0) >= 0;

  return (
    <article
      className="admin-panel admin-in p-5"
      style={{ "--admin-delay": `${delay}s` } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="admin-eyebrow truncate">{label}</p>
          <p className="admin-title mt-2.5 text-[1.75rem] leading-none">{value}</p>
        </div>
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl",
            `tone-${tone}`,
          )}
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
      </div>

      {trend && <Sparkline points={trend} className="mt-4" />}

      {(delta !== undefined || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                up ? "text-[#3f6a61]" : "text-[#b3607f]",
              )}
            >
              {up ? (
                <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
              ) : (
                <ArrowDownRight className="size-3.5" strokeWidth={2.4} />
              )}
              {up ? "+" : ""}
              {delta}%
            </span>
          )}
          {hint && <span className="admin-muted truncate">{hint}</span>}
        </div>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- progreso */

export function Meter({
  value,
  tone = "rose",
  className,
}: {
  /** 0–100 */
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const fills: Record<Tone, string> = {
    rose: "from-rose-soft to-rose",
    mint: "from-mint-soft to-mint",
    lavender: "from-lavender-soft to-lavender",
    peach: "from-peach-soft to-peach",
    gold: "from-gold-soft to-gold",
    neutral: "from-rose-soft to-lavender",
  };

  return (
    <span
      className={cn("block h-1.5 w-full overflow-hidden rounded-full", className)}
      style={{ background: "var(--admin-line-soft)" }}
      role="presentation"
    >
      <span
        className={cn("block h-full rounded-full bg-gradient-to-r", fills[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </span>
  );
}

/* ----------------------------------------------------------------- avatar */

export function Avatar({
  initials,
  tone = "rose",
  size = "md",
}: {
  initials: string;
  tone?: Tone;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display",
        `tone-${tone}`,
        size === "sm" ? "size-8 text-[0.7rem]" : "size-10 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------ estado vacío */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="tone-rose grid size-14 place-items-center rounded-3xl">
        <Icon className="size-6" strokeWidth={1.7} />
      </span>
      <p className="admin-title mt-5 text-lg">{title}</p>
      <p className="admin-muted mt-2 max-w-sm text-sm leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- toolbar */

/**
 * Barra de filtros. Es presentacional a propósito: el input es no controlado
 * (se puede escribir en él sin una línea de JavaScript) y los filtros son
 * marcado. La lógica llega cuando exista el backend.
 */
export function Toolbar({
  placeholder,
  filters,
  children,
  /** Con `name`, el buscador es un campo real dentro de un <form method="get">. */
  name,
  defaultValue,
}: {
  placeholder: string;
  filters?: string[];
  children?: React.ReactNode;
  name?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1 basis-64">
        <span className="sr-only">{placeholder}</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="admin-muted pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2"
        >
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="admin-input pl-11"
        />
      </label>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter, i) => (
            <button
              key={filter}
              type="button"
              className={cn("admin-btn px-4 py-2 text-[0.82rem]", i === 0 && "admin-btn-primary")}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[0.7rem] uppercase tracking-[0.14em] shadow-petal backdrop-blur-sm",
  {
    variants: {
      tone: {
        rose: "bg-rose-soft/90 text-[#8a4c62]",
        mint: "bg-mint-soft/90 text-[#3f6a61]",
        lavender: "bg-lavender-soft/90 text-[#5e4b86]",
        peach: "bg-peach-soft/90 text-[#8a5b3f]",
        gold: "bg-gold-soft/90 text-[#7c6023]",
        cream: "bg-white/85 text-ink-soft ring-1 ring-rose/25",
      },
    },
    defaultVariants: { tone: "rose" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Etiqueta de sección: “✧ Nuestras categorías” */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-ink-soft shadow-petal ring-1 ring-white/70 backdrop-blur-md",
        className,
      )}
    >
      <span aria-hidden className="text-rose">
        ✧
      </span>
      {children}
    </span>
  );
}

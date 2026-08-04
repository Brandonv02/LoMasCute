"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botón de marca. El efecto líquido nace del cursor: guardamos su posición
 * en variables CSS (--mx/--my) y el pseudo-elemento ::before la sigue.
 */
const buttonVariants = cva(
  "btn-liquid group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-tight disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-rose-soft via-rose to-lavender text-ink shadow-soft hover:shadow-lift",
        cream:
          "bg-white/85 text-ink shadow-petal ring-1 ring-white/80 backdrop-blur-md hover:bg-white",
        outline:
          "border border-rose/45 bg-white/45 text-ink backdrop-blur-md hover:border-rose hover:bg-white/75",
        mint: "bg-gradient-to-br from-mint-soft via-mint to-mint-soft text-ink shadow-soft hover:shadow-lift",
        gold: "bg-gradient-to-br from-gold-soft via-gold to-peach text-ink shadow-soft hover:shadow-lift",
        ghost: "text-ink-soft hover:bg-rose-mist/70 hover:text-ink",
        link: "text-ink underline decoration-rose decoration-2 underline-offset-4 hover:decoration-lavender",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        md: "h-12 px-7 text-[0.95rem]",
        lg: "h-14 px-9 text-base",
        xl: "h-16 px-11 text-lg",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onMouseMove, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      onMouseMove?.(event);
    };

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onMouseMove={handleMove}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };

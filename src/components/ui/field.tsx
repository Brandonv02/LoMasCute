"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "mb-2 block font-display text-sm tracking-tight text-ink",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

const baseField =
  "w-full rounded-2xl border border-rose/30 bg-white/70 px-5 py-3.5 text-[0.95rem] text-ink shadow-inner outline-none backdrop-blur-md transition-all duration-500 placeholder:text-ink-muted/80 hover:border-rose/60 focus:border-rose focus:bg-white focus:shadow-soft focus:ring-4 focus:ring-rose/20 disabled:opacity-50 aria-[invalid=true]:border-[#d98aa6] aria-[invalid=true]:ring-[#d98aa6]/20";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseField, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={4}
    className={cn(baseField, "resize-none leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(baseField, "appearance-none pr-12", className)}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
));
Select.displayName = "Select";

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-[#b3607f]">
      <span aria-hidden>·</span>
      {children}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-1 text-rose" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only">(obligatorio)</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Encabezado de sección reutilizable: etiqueta, título y enlace opcional */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  link,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  link?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "flex flex-col items-center")}>
        <Reveal kind="up" duration={0.7}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal kind="blur" delay={0.08}>
          <h2 className="mt-5 font-display text-[2.1rem] leading-[1.08] md:text-[3rem]">
            {title}
            {highlight && (
              <>
                {" "}
                <span className="text-gradient">{highlight}</span>
              </>
            )}
          </h2>
        </Reveal>
        {description && (
          <Reveal kind="up" delay={0.16}>
            <p
              className={cn(
                "mt-4 max-w-xl leading-relaxed text-ink-soft",
                align === "center" && "mx-auto",
              )}
            >
              {description}
            </p>
          </Reveal>
        )}
      </div>

      {link && (
        <Reveal kind="up" delay={0.2} className="shrink-0">
          <Link
            href={link.href}
            className="group inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-3 font-display text-sm text-ink shadow-petal ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-soft"
          >
            {link.label}
            <ArrowRight
              className="size-4 transition-transform duration-500 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

import { SectionHeading } from "@/components/sections/section-heading";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Acordeón de preguntas frecuentes, con apertura suave */
export function Faq({
  faqs,
  eyebrow = "Preguntas frecuentes",
  title,
  highlight,
  description,
  className,
}: {
  faqs: { q: string; a: string }[];
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("relative py-24 md:py-28", className)} aria-labelledby="faq">
      <div className="container-cute">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              highlight={highlight}
              description={description}
            />
          </div>

          <Reveal kind="blur">
            <FaqAccordion faqs={faqs} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

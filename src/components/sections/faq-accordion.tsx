"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

/** La parte interactiva del bloque de preguntas: el resto es servidor. */
export function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {faqs.map((faq, i) => (
        <Accordion.Item
          key={faq.q}
          value={`item-${i}`}
          className="group overflow-hidden rounded-[1.75rem] bg-white/62 ring-1 ring-white/75 backdrop-blur-md transition-all duration-600 data-[state=open]:bg-white/85 data-[state=open]:shadow-soft"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-[1.05rem] text-ink transition-colors duration-400 hover:text-[#a8556f] md:px-7">
              {faq.q}
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-mist text-[#a8556f] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)] group-data-[state=open]:rotate-135"
              >
                <Plus className="size-4" strokeWidth={2.2} />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accOut_0.35s_cubic-bezier(0.22,1,0.36,1)] data-[state=open]:animate-[accIn_0.45s_cubic-bezier(0.22,1,0.36,1)]">
            <p className="px-6 pb-6 leading-relaxed text-ink-soft md:px-7">{faq.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

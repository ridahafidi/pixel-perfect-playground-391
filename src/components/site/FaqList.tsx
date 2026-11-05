import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export type FaqItem = { q: string; a: ReactNode };

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={`faq-${i}`} className="border-border">
          <AccordionTrigger className="gap-6 py-6 text-left font-display text-lg font-medium hover:no-underline md:text-xl [&[data-state=open]]:text-accent-ink">
            <span className="flex items-baseline gap-5">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {item.q}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-7 pl-10 pr-4 text-base leading-relaxed text-muted-foreground md:pr-16">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  id: string;
  index: string;
  label: string;
  title: string;
  text: string;
  points: { title: string; text: string }[];
  visual: ReactNode;
  reverse?: boolean;
};

/** Large editorial feature row with alternating layout. */
export function FeatureSection({ id, index, label, title, text, points, visual, reverse }: Props) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-24 md:py-32">
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20",
        )}
      >
        <Reveal className={cn(reverse && "lg:order-2")}>
          <div className="flex items-center gap-4">
            <span className="font-display text-6xl font-bold leading-none text-foreground/10 md:text-7xl">{index}</span>
            <span className="eyebrow">{label}</span>
          </div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] md:text-5xl">{title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{text}</p>
          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.title} className="border-l border-border pl-4">
                <dt className="flex items-center gap-2 font-display font-medium">
                  <Check className="size-4 text-accent-ink" />
                  {p.title}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={120} className={cn(reverse && "lg:order-1")}>
          {visual}
        </Reveal>
      </div>
    </section>
  );
}

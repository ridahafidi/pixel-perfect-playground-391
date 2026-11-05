import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  as: H = "h2",
}: Props) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <H className="text-balance text-4xl font-semibold leading-[1.05] md:text-5xl lg:text-[3.5rem]">
        {title}
      </H>
      {intro && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground [.text-center_&]:mx-auto">
          {intro}
        </p>
      )}
    </Reveal>
  );
}

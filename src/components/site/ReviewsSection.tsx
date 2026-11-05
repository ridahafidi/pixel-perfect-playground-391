import { Link } from "@tanstack/react-router";
import { BadgeCheck, MessageSquarePlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { REVIEWS, type Review } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

function Stars({ rating, muted }: { rating: number; muted?: boolean }) {
  return (
    <div className="flex gap-1" aria-label={muted ? "Noch keine Bewertung" : `${rating} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            !muted && i < rating ? "fill-primary text-primary" : "text-border",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-lg border border-border bg-surface-2 p-8">
      <div>
        <Stars rating={review.rating} />
        <blockquote className="mt-6 font-display text-xl leading-snug">„{review.quote}“</blockquote>
      </div>
      <figcaption className="mt-8 flex items-end justify-between gap-4 border-t border-border pt-5 text-sm">
        <div>
          <p className="font-medium">{review.author}</p>
          {review.business && <p className="text-muted-foreground">{review.business}</p>}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {review.verified && (
            <span className="mb-1 inline-flex items-center gap-1 text-accent-ink">
              <BadgeCheck className="size-3.5" /> Verifiziert
            </span>
          )}
          <p>
            Quelle:{" "}
            {review.sourceUrl ? (
              <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {review.source}
              </a>
            ) : (
              review.source
            )}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function ReviewsSection() {
  if (REVIEWS.length > 0) {
    return (
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-5">
          {REVIEWS.map((r, i) => (
            <CarouselItem key={i} className="pl-5 md:basis-1/2 lg:basis-1/3">
              <ReviewCard review={r} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-8 flex gap-2">
          <CarouselPrevious className="static translate-y-0 border-border bg-transparent" />
          <CarouselNext className="static translate-y-0 border-border bg-transparent" />
        </div>
      </Carousel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Reveal className="relative overflow-hidden rounded-lg border border-border bg-surface-2 p-8 md:p-12">
        <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative">
          <Stars rating={0} muted />
          <h3 className="mt-8 max-w-lg text-3xl font-semibold leading-tight md:text-4xl">
            Hier entstehen die ersten echten Erfahrungsberichte.
          </h3>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            KFZ Faktura ist ein junges Produkt. Wir veröffentlichen ausschließlich echte, nachvollziehbare Bewertungen
            von Werkstätten, die die Software einsetzen – keine erfundenen Zitate, keine geschönten Zahlen.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-10">
            <Link to="/bewertungen" hash="kontakt">
              <MessageSquarePlus />
              Erfahrung teilen
            </Link>
          </Button>
        </div>
      </Reveal>
      <div className="grid gap-5">
        {[
          ["Echt", "Nur Bewertungen mit eindeutig zuordenbarer Quelle."],
          ["Transparent", "Jede Bewertung mit Herkunftsangabe – ‚verifiziert‘ nur, wenn belegt."],
          ["Ungefiltert", "Auch kritisches Feedback hilft, die Software zu verbessern."],
        ].map(([t, d], i) => (
          <Reveal key={t} delay={i * 100} className="rounded-lg border border-border p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-ink">Grundsatz 0{i + 1}</p>
            <p className="mt-3 font-display text-xl font-medium">{t}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

import { useLanguage } from "@/lib/language";
import { LocalizedReviews } from "@/components/site/LocalizedPages";
import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Lock, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import werkbank from "@/assets/werkbank.jpg";

export const Route = createFileRoute("/bewertungen")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/bewertungen",
      title: "Bewertungen & Über NexaFlow",
      description:
        "Erfahren Sie mehr über NexaFlow und entdecken Sie authentische Erfahrungen und Produktinformationen.",
      origin: loaderData,
    }),
  component: ReviewsPage,
});

const PILLARS = [
  ["Kunden & Fahrzeuge", "Stammdaten, FIN sowie HSN/TSN – sauber miteinander verknüpft."],
  ["Dokumente", "Angebote, Aufträge und Rechnungen in einem durchgängigen Ablauf."],
  ["Lager", "Ersatzteile und eingelagerte Reifen mit Beständen und Lagerplätzen."],
];

function ReviewsPage() {
  const { locale } = useLanguage();
  if (locale !== "de") return <LocalizedReviews />;
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent_80%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
          <Breadcrumbs current="Bewertungen" />
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="eyebrow mb-6">Bewertungen & Über uns</p>
            <h1 className="text-balance text-5xl font-semibold leading-[1] md:text-7xl">
              Vertrauen entsteht durch gute Werkzeuge.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Eine Software sollte den Arbeitsalltag einfacher machen. Entdecken Sie NexaFlow und erfahren Sie mehr
              über das Produkt.
            </p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ReviewsSection />
        </div>
      </section>

      {/* ABOUT */}
      <section id="ueber" className="scroll-mt-20 border-t border-border">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-full">
            <img
              src={werkbank}
              alt="Werkbank in einer Kfz-Werkstatt mit Drehmomentschlüssel, Checkliste und Laptop"
              width={1600}
              height={1008}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <div className="px-5 py-24 md:px-12 lg:px-16 lg:py-32">
            <SectionHeading
              eyebrow="Über NexaFlow"
              title="Entwickelt für die Anforderungen moderner Werkstätten."
            />
            <Reveal>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                NexaFlow wurde entwickelt, um zentrale Verwaltungsaufgaben von Kfz-Werkstätten in einer
                übersichtlichen Desktop-Anwendung zusammenzuführen. Von Kunden- und Fahrzeugdaten über Rechnungen bis
                hin zu Lagerinformationen – alles mit dem Ziel, den täglichen Verwaltungsaufwand besser zu
                organisieren.
              </p>
            </Reveal>
            <div className="mt-12 space-y-0 border-t border-border">
              {PILLARS.map(([t, d], i) => (
                <Reveal key={t} delay={i * 90} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-5">
                  <span className="font-mono text-xs text-accent-ink">0{i + 1}</span>
                  <div>
                    <p className="font-display text-lg font-medium">{t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="kontakt" className="theme-paper scroll-mt-20 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Kontakt"
              title="Sprechen Sie mit uns."
              intro="Fragen zu Funktionen, Lizenzen oder einer konfigurierten Version? Schreiben Sie uns – oder teilen Sie Ihre Erfahrung mit NexaFlow."
            />
            <div className="mt-12 space-y-4">
              <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
                <Mail className="mt-0.5 size-5 shrink-0 text-accent-ink" />
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="mt-1 font-mono text-sm">{SITE.contactEmail}</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
                <LifeBuoy className="mt-0.5 size-5 shrink-0 text-accent-ink" />
                <div>
                  <p className="text-sm text-muted-foreground">Support</p>
                  <p className="mt-1 font-mono text-sm">{SITE.supportInfo}</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border border-border p-5 text-sm leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-5 shrink-0" />
                <p>
                  <span className="font-medium text-foreground">Datenschutz:</span> Ihre Angaben werden ausschließlich
                  zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben. Details finden Sie in der
                  Datenschutzerklärung.
                </p>
              </div>
            </div>
          </div>
          <Reveal className="rounded-xl border border-border bg-card p-6 md:p-10">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}


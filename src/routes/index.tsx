import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Layers, ListChecks, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/site/HeroVisual";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FeatureTabs } from "@/components/site/FeatureTabs";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList, type FaqItem } from "@/components/site/FaqList";
import { DownloadButton } from "@/components/site/DownloadButton";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";
import { DOWNLOADS, SITE } from "@/lib/site";
import werkstattHalle from "@/assets/werkstatt-halle.jpg";

const TITLE = "KFZ Faktura – Werkstattsoftware für moderne Kfz-Betriebe";
const DESCRIPTION =
  "Kunden, Fahrzeuge, Rechnungen und Lagerverwaltung zentral organisieren. Entdecken Sie KFZ Faktura, die Desktop-Software für Ihren Werkstattalltag.";

export const Route = createFileRoute("/")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) => {
    const base = seo({ path: "/", title: TITLE, description: DESCRIPTION, origin: loaderData });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: "KFZ Faktura",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Windows (x64)",
                softwareVersion: SITE.version,
                inLanguage: "de-DE",
                description:
                  "Windows-Desktop-Anwendung für Kfz-Werkstätten: Kundenverwaltung, Fahrzeugverwaltung, Rechnungen und Dokumente, Ersatzteillager und Reifenlager.",
                ...(loaderData ? { url: loaderData } : {}),
              },
              {
                "@type": "Organization",
                name: "KFZ Faktura",
                ...(loaderData ? { url: loaderData } : {}),
              },
            ],
          }),
        },
      ],
    };
  },
  component: HomePage,
});

const VALUES = [
  {
    icon: Layers,
    title: "Alles an einem Ort",
    text: "Kunden, Fahrzeuge und Werkstattdokumente zentral verwalten – ohne verstreute Informationen.",
  },
  {
    icon: ListChecks,
    title: "Strukturierte Abläufe",
    text: "Behalten Sie Rechnungen, Aufträge und Ersatzteile jederzeit im Überblick.",
  },
  {
    icon: Gauge,
    title: "Volle Kontrolle",
    text: "Erkennen Sie offene Rechnungen, Lagerbestände und wichtige Kennzahlen auf einen Blick.",
  },
];

const STEPS = [
  { n: "01", title: "Kunden erfassen", text: "Organisieren Sie Ihre Kunden und deren Fahrzeuge." },
  {
    n: "02",
    title: "Werkstatt verwalten",
    text: "Bearbeiten Sie Angebote, Aufträge, Rechnungen und Lagerdaten.",
  },
  {
    n: "03",
    title: "Überblick behalten",
    text: "Verfolgen Sie wichtige Kennzahlen und offene Vorgänge über Ihr Dashboard.",
  },
];

const FACTS = [
  ["6", "Kernmodule"],
  ["x64", "Windows-Desktop"],
  [SITE.version, "Aktuelle Version"],
  ["Lokal", "Datenhaltung"],
];

const FAQ: FaqItem[] = [
  {
    q: "Was ist KFZ Faktura?",
    a: "KFZ Faktura ist eine Windows-Desktop-Anwendung für Kfz-Werkstätten. Sie bündelt zentrale Verwaltungsaufgaben – Kunden, Fahrzeuge, Angebote, Aufträge, Rechnungen, Ersatzteile und Reifenlager – in einer übersichtlichen Oberfläche.",
  },
  {
    q: "Für welche Werkstätten ist die Software geeignet?",
    a: "KFZ Faktura richtet sich an freie Werkstätten, Kfz-Meisterbetriebe und Fahrzeugservice-Betriebe, die ihre administrativen Abläufe an einem Windows-Arbeitsplatz strukturiert organisieren möchten.",
  },
  {
    q: "Welche Funktionen bietet KFZ Faktura?",
    a: "Dashboard mit Umsatz- und Rechnungskennzahlen, Kundenverwaltung, Fahrzeugverwaltung mit FIN sowie HSN/TSN, Dokumente und Rechnungen (Angebote, Aufträge, Rechnungen inklusive Umwandlung), Ersatzteillager mit EK-/VK-Preisen und Mindestbestand-Warnungen sowie ein Reifenlager mit Lagerplätzen, Saison und Profiltiefe.",
  },
  {
    q: "Welche Windows-Version wird unterstützt?",
    a: "KFZ Faktura 1.0.0 ist für Windows x64 (64-Bit) verfügbar. Die genaue Mindestversion von Windows wird nach abschließender Prüfung veröffentlicht.",
  },
  {
    q: "Wie kann ich KFZ Faktura installieren?",
    a: "Sie haben zwei Möglichkeiten: Die portable Version (ZIP) entpacken Sie und starten anschließend „KFZ Faktura.exe“. Alternativ nutzen Sie den klassischen Windows-Installer für eine geführte Installation. In beiden Fällen sind danach Lizenzierung und Anmeldung einzurichten.",
  },
  {
    q: "Benötige ich eine Internetverbindung?",
    a: "Die Anwendung arbeitet mit einer lokalen Datenbank auf Ihrem Rechner. Die Anmeldung erfolgt jedoch über ein freigegebenes Google-Konto – dafür ist eine Internetverbindung erforderlich. Die Software ist also nicht vollständig ohne Konfiguration und Online-Anmeldung nutzbar.",
  },
  {
    q: "Wie funktioniert die Lizenzierung?",
    a: "Die Nutzung erfordert eine gültige Offline-Maschinenlizenz, die an den jeweiligen Rechner gebunden ist, sowie ein freigegebenes Google-Konto für die Anmeldung. Im aktuellen Build sind die Google-Zugangsdaten noch Platzhalter; die Anmeldung zeigt daher einen Konfigurationsfehler, bis eine korrekt konfigurierte Version bereitgestellt wird.",
  },
  {
    q: "Wie kann ich Unterstützung erhalten?",
    a: (
      <>
        Nutzen Sie das{" "}
        <Link to="/bewertungen" hash="kontakt" className="text-foreground underline underline-offset-4">
          Kontaktformular
        </Link>
        . Weitere Support-Informationen folgen in Kürze.
      </>
    ),
  },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent_85%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-5 pb-24 md:px-8 md:pb-32 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="eyebrow flex items-center gap-3">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-primary" />
              Werkstattmanagement neu gedacht
            </p>
            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl xl:text-7xl">
              Ihre Werkstatt.
              <br />
              Ihr Überblick.
              <br />
              <span className="text-accent-ink">Ihr Erfolg.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Verwalten Sie Kunden, Fahrzeuge, Rechnungen, Ersatzteile und Reifenlager an einem zentralen Ort.
              KFZ Faktura hilft Ihnen, administrative Abläufe zu vereinfachen – damit Sie sich auf das konzentrieren
              können, was wirklich zählt: Ihre Werkstatt.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/funktionen">
                  Jetzt entdecken
                  <ArrowRight />
                </Link>
              </Button>
              <DownloadButton option={DOWNLOADS.portable} label="Windows-Version herunterladen" variant="line" />
            </div>
            <p className="mt-8 flex items-center gap-2.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-accent-ink" />
              Entwickelt für den professionellen Werkstattalltag.
            </p>
          </div>
          <HeroVisual />
        </div>

        {/* Fact strip */}
        <div className="relative border-y border-border bg-surface-2/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 md:grid-cols-4 md:px-8">
            {FACTS.map(([v, l], i) => (
              <div
                key={l}
                className="border-border py-7 pr-4 [&:not(:first-child)]:md:border-l [&:not(:first-child)]:md:pl-8 [&:nth-child(even)]:border-l [&:nth-child(even)]:pl-6"
              >
                <dt className="sr-only">{l}</dt>
                <dd>
                  <Reveal delay={i * 80}>
                    <span className="block font-display text-3xl font-semibold md:text-4xl">{v}</span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {l}
                    </span>
                  </Reveal>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Warum KFZ Faktura" title="Weniger Verwaltung. Mehr Werkstatt." />
          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 100} className="group relative bg-background p-8 transition-colors duration-500 hover:bg-surface-2 md:p-10">
                  <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-md border border-border text-accent-ink transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{v.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES PREVIEW */}
      <section className="border-t border-border bg-surface-2/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Produktmodule"
            title="Ein Werkzeug. Viele Möglichkeiten."
            intro="Wählen Sie einen Bereich und sehen Sie, wie KFZ Faktura die jeweilige Aufgabe organisiert."
          />
          <div className="mt-14">
            <FeatureTabs />
          </div>
        </div>
      </section>

      {/* IMAGE BAND */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src={werkstattHalle}
          alt="Moderne Kfz-Werkstatt mit Fahrzeug auf der Hebebühne bei Abendlicht"
          width={1600}
          height={1008}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="bg-fade-r absolute inset-0 opacity-90" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-16 md:px-8">
          <Reveal className="max-w-xl">
            <p className="eyebrow mb-5">Für den Werkstattalltag</p>
            <p className="font-display text-3xl font-medium leading-tight md:text-5xl">
              Die Hebebühne ist voll. Die Verwaltung sollte es nicht sein.
            </p>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS (light section) */}
      <section className="theme-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="So funktioniert's" title="Einfacher organisiert. Schritt für Schritt." />
          <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 120} className="relative md:pr-10 [&:not(:first-child)]:md:border-l [&:not(:first-child)]:md:pl-10">
                <span className="font-display text-7xl font-bold leading-none text-accent-ink md:text-8xl">{s.n}</span>
                <h3 className="mt-8 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-16 flex flex-wrap items-center gap-4 border-t border-border pt-10">
            <Button asChild size="xl" className="bg-foreground text-background hover:bg-foreground/85">
              <Link to="/funktionen">
                Funktionen ansehen
                <ArrowRight />
              </Link>
            </Button>
            <Link to="/download" className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline">
              <Download className="size-4" />
              Zum Download
            </Link>
          </Reveal>
        </div>
      </section>

      {/* DOWNLOAD CTA */}
      <CtaBand />

      {/* FAQ */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <SectionHeading
            eyebrow="Häufige Fragen"
            title="Gut zu wissen."
            intro="Antworten auf die wichtigsten Fragen rund um Funktionen, Installation und Lizenzierung."
          />
          <Reveal>
            <FaqList items={FAQ} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

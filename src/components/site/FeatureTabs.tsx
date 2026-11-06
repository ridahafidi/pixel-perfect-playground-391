import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppWindow, ModuleScreen, type ModuleKey } from "@/components/mockup/AppWindow";

type Tab = {
  id: string;
  label: string;
  module: ModuleKey;
  title: string;
  text: string;
  points: string[];
};

const TABS: Tab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    module: "dashboard",
    title: "Kennzahlen, die Ihren Tag strukturieren.",
    text: "Umsatz, offene Rechnungen sowie Kunden- und Fahrzeugstatistiken – kompakt zusammengefasst auf der ersten Seite.",
    points: ["Umsatzübersicht", "Offene Rechnungen", "Kunden- & Fahrzeugzahlen"],
  },
  {
    id: "kunden",
    label: "Kunden & Fahrzeuge",
    module: "kunden",
    title: "Jeder Kunde mit seinen Fahrzeugen.",
    text: "Kundendaten zentral pflegen und die zugehörigen Fahrzeuge direkt im Blick behalten – inklusive FIN sowie HSN/TSN.",
    points: ["Zentrale Kundenakte", "Verknüpfte Fahrzeuge", "FIN, HSN & TSN"],
  },
  {
    id: "rechnungen",
    label: "Rechnungen",
    module: "rechnungen",
    title: "Vom Angebot bis zur Rechnung.",
    text: "Angebote, Aufträge und Rechnungen an einem Ort verwalten und Dokumente in den nächsten Schritt überführen.",
    points: ["Angebote & Kostenvoranschläge", "Arbeitsaufträge", "Dokumentumwandlung"],
  },
  {
    id: "ersatzteile",
    label: "Ersatzteile",
    module: "ersatzteile",
    title: "Ihr Lager, jederzeit nachvollziehbar.",
    text: "Ersatzteile mit Einkaufs- und Verkaufspreisen erfassen, Bestände führen und bei Unterschreitung des Mindestbestands gewarnt werden.",
    points: ["EK- & VK-Preise", "Bestandsführung", "Mindestbestand-Warnungen"],
  },
  {
    id: "reifen",
    label: "Reifenlager",
    module: "reifen",
    title: "Eingelagerte Reifen. Sofort gefunden.",
    text: "Reifensätze kundenbezogen erfassen – mit Saison, Profiltiefe und dem genauen Lagerplatz im Regal.",
    points: ["Kundenbezug", "Saison & Profiltiefe", "Regal- & Lagerplätze"],
  },
];

export function FeatureTabs() {
  const [active, setActive] = useState<string>("dashboard");
  const tab = (TABS.find((t) => t.id === active) ?? TABS[0]) as Tab;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Funktionen von NEXAFLOW"
        className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 md:mx-0 md:px-0"
      >
        {TABS.map((t, i) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative flex shrink-0 items-baseline gap-2.5 px-4 py-4 text-sm transition-colors md:px-5",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="font-mono text-[10px] text-accent-ink">0{i + 1}</span>
              {t.label}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 bg-primary transition-transform duration-300",
                  isActive ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab.id}`}
        aria-labelledby={`tab-${tab.id}`}
        className="grid items-center gap-10 pt-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16"
      >
        <div key={`copy-${tab.id}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h3 className="text-3xl font-semibold leading-tight md:text-4xl">{tab.title}</h3>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{tab.text}</p>
          <ul className="mt-8 space-y-3">
            {tab.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 items-center justify-center rounded-sm bg-primary/15 text-accent-ink">
                  <Check className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            to="/funktionen"
            className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-accent-ink"
          >
            Alle Funktionen im Detail
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div key={`ui-${tab.id}`} className="animate-in fade-in zoom-in-[0.98] duration-500">
          <AppWindow active={tab.module}>
            <ModuleScreen module={tab.module} />
          </AppWindow>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Illustrative Darstellung · Beispieldaten
          </p>
        </div>
      </div>
    </div>
  );
}

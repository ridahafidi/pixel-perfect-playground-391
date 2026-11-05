import { createFileRoute } from "@tanstack/react-router";
import {
  AppWindow,
  CustomersScreen,
  DashboardScreen,
  InvoicesScreen,
  PartsScreen,
  TiresScreen,
  VehicleScreen,
} from "@/components/mockup/AppWindow";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { FeatureSection } from "@/components/site/FeatureSection";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";
import werkstattHalle from "@/assets/werkstatt-halle.jpg";
import ersatzteile from "@/assets/ersatzteile.jpg";
import reifenlager from "@/assets/reifenlager.jpg";

export const Route = createFileRoute("/funktionen")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/funktionen",
      title: "Funktionen – KFZ Faktura Werkstattsoftware",
      description:
        "Entdecken Sie Dashboard, Kundenverwaltung, Fahrzeugverwaltung, Rechnungen, Ersatzteile und Reifenlager in KFZ Faktura.",
      origin: loaderData,
    }),
  component: FeaturesPage,
});

const JUMP = [
  ["dashboard", "Dashboard"],
  ["kunden", "Kunden"],
  ["fahrzeuge", "Fahrzeuge"],
  ["dokumente", "Dokumente"],
  ["lager", "Ersatzteile"],
  ["reifen", "Reifenlager"],
] as const;

function Caption() {
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      Illustrative Darstellung · Beispieldaten
    </p>
  );
}

function PhotoWithWindow({
  src,
  alt,
  children,
  active,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  active: "ersatzteile" | "reifen";
}) {
  return (
    <div>
      <div className="relative">
        <img
          src={src}
          alt={alt}
          width={1408}
          height={1008}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
        <div className="absolute -bottom-10 left-4 right-4 sm:left-auto sm:-right-6 sm:w-[88%] lg:-right-10">
          <AppWindow active={active} compact>
            {children}
          </AppWindow>
        </div>
      </div>
      <div className="pt-12">
        <Caption />
      </div>
    </div>
  );
}

function FeaturesPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <img
          src={werkstattHalle}
          alt=""
          width={1600}
          height={1008}
          className="absolute inset-0 -z-10 size-full object-cover opacity-35"
        />
        <div className="bg-fade-b absolute inset-0 -z-10" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
          <Breadcrumbs current="Funktionen" />
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="eyebrow mb-6">Funktionen</p>
            <h1 className="text-balance text-5xl font-semibold leading-[1] md:text-7xl">
              Alles, was Ihre Werkstattverwaltung braucht.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Von der Kundenverwaltung bis zur Reifenlagerorganisation: KFZ Faktura verbindet wichtige
              Verwaltungsbereiche in einer übersichtlichen Desktop-Anwendung.
            </p>
          </div>
          <nav aria-label="Funktionsbereiche" className="mt-14 flex flex-wrap gap-2">
            {JUMP.map(([id, label], i) => (
              <a
                key={id}
                href={`#${id}`}
                className="group inline-flex items-center gap-2.5 rounded-md border border-border bg-background/60 px-4 py-2.5 text-sm backdrop-blur transition-colors hover:border-primary"
              >
                <span className="font-mono text-[10px] text-accent-ink">0{i + 1}</span>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <FeatureSection
        id="dashboard"
        index="01"
        label="Dashboard"
        title="Die wichtigsten Zahlen. Auf einen Blick."
        text="Das Dashboard fasst zusammen, was in Ihrer Werkstatt gerade passiert. Statt Zahlen aus verschiedenen Listen zusammenzusuchen, sehen Sie die zentralen Kennzahlen direkt beim Start."
        points={[
          { title: "Umsatzübersicht", text: "Umsatzentwicklung übersichtlich im Zeitverlauf dargestellt." },
          { title: "Offene Rechnungen", text: "Ausstehende Beträge und offene Vorgänge sofort erkennen." },
          { title: "Kunden & Fahrzeuge", text: "Statistiken zu Ihrem Kunden- und Fahrzeugbestand." },
          { title: "Werkstatt-KPIs", text: "Operative Kennzahlen für fundierte Entscheidungen." },
        ]}
        visual={
          <>
            <AppWindow active="dashboard">
              <DashboardScreen />
            </AppWindow>
            <Caption />
          </>
        }
      />

      <FeatureSection
        id="kunden"
        index="02"
        label="Kundenverwaltung"
        title="Ihre Kunden. Zentral organisiert."
        text="Alle Kundeninformationen an einem Ort – von Kontaktdaten bis zu den zugehörigen Fahrzeugen. So haben Sie bei jedem Anruf und jedem Auftrag sofort den richtigen Kontext."
        reverse
        points={[
          { title: "Zentrale Kundenakte", text: "Kundendaten gebündelt statt verstreut in Ordnern und Listen." },
          { title: "Strukturierte Informationen", text: "Kundeninformationen einheitlich erfassen und pflegen." },
          { title: "Verknüpfte Fahrzeuge", text: "Direkter Zugriff auf alle Fahrzeuge eines Kunden." },
          { title: "Schnelles Wiederfinden", text: "Kunden über die Suche rasch aufrufen." },
        ]}
        visual={
          <>
            <AppWindow active="kunden">
              <CustomersScreen />
            </AppWindow>
            <Caption />
          </>
        }
      />

      <FeatureSection
        id="fahrzeuge"
        index="03"
        label="Fahrzeugverwaltung"
        title="Jedes Fahrzeug im richtigen Kontext."
        text="Fahrzeuge werden mit ihren Identifikationsdaten erfasst und dem jeweiligen Kunden zugeordnet. FIN sowie HSN und TSN stehen bereit, wenn Sie sie für Teilebestellung oder Auftrag benötigen."
        points={[
          { title: "Fahrzeugidentifikation", text: "Kennzeichen, Modell und Stammdaten je Fahrzeug." },
          { title: "FIN / VIN", text: "Fahrzeug-Identifizierungsnummer sauber hinterlegt." },
          { title: "HSN & TSN", text: "Hersteller- und Typschlüsselnummer direkt am Fahrzeug." },
          { title: "Kundenbezug", text: "Jedes Fahrzeug eindeutig seinem Halter zugeordnet." },
        ]}
        visual={
          <>
            <AppWindow active="fahrzeuge">
              <VehicleScreen />
            </AppWindow>
            <Caption />
          </>
        }
      />

      <FeatureSection
        id="dokumente"
        index="04"
        label="Rechnungen & Dokumente"
        title="Dokumente und Aufträge strukturiert verwalten."
        text="Angebote, Kostenvoranschläge, Arbeitsaufträge und Rechnungen laufen in einem Bereich zusammen. Dokumente lassen sich in den nächsten Schritt umwandeln – etwa ein Auftrag in eine Rechnung."
        reverse
        points={[
          { title: "Rechnungsverwaltung", text: "Rechnungen erstellen, einsehen und ihren Status verfolgen." },
          { title: "Angebote & Kostenvoranschläge", text: "Angebote für Ihre Kunden vorbereiten." },
          { title: "Arbeitsaufträge", text: "Werkstattaufträge strukturiert anlegen und führen." },
          { title: "Dokumentumwandlung", text: "Dokumente in den nächsten Bearbeitungsschritt überführen." },
        ]}
        visual={
          <>
            <AppWindow active="rechnungen">
              <InvoicesScreen />
            </AppWindow>
            <Caption />
          </>
        }
      />

      <FeatureSection
        id="lager"
        index="05"
        label="Ersatzteillager"
        title="Behalten Sie Ihr Ersatzteillager im Griff."
        text="Erfassen Sie Ersatzteile mit Einkaufs- und Verkaufspreisen und führen Sie Ihre Bestände nach. Sinkt ein Artikel unter den festgelegten Mindestbestand, werden Sie darauf hingewiesen."
        points={[
          { title: "Teilestammdaten", text: "Ersatzteile mit Artikelnummer und Bezeichnung erfassen." },
          { title: "Einkaufspreise", text: "EK-Preise je Artikel hinterlegen." },
          { title: "Verkaufspreise", text: "VK-Preise für die Abrechnung bereithalten." },
          { title: "Mindestbestand", text: "Warnungen, bevor ein Teil ausgeht." },
        ]}
        visual={
          <PhotoWithWindow
            src={ersatzteile}
            alt="Geordnetes Ersatzteillager mit Bremsscheiben, Filtern und beschrifteten Regalfächern"
            active="ersatzteile"
          >
            <PartsScreen />
          </PhotoWithWindow>
        }
      />

      <FeatureSection
        id="reifen"
        index="06"
        label="Reifenlager"
        title="Reifenlager. Klar strukturiert."
        text="Eingelagerte Reifensätze werden dem Kunden zugeordnet und mit Saison, Profiltiefe und Lagerplatz dokumentiert. Zum Saisonwechsel wissen Sie sofort, wo welcher Satz steht."
        reverse
        points={[
          { title: "Saisonale Reifen", text: "Sommer- und Winterreifen getrennt erfassen." },
          { title: "Profiltiefe", text: "Profilinformationen je Reifensatz dokumentieren." },
          { title: "Kundenbezug", text: "Jeder Satz mit Kunde und Fahrzeug verknüpft." },
          { title: "Lagerplätze", text: "Regal- und Stellplatzpositionen eindeutig hinterlegt." },
        ]}
        visual={
          <PhotoWithWindow
            src={reifenlager}
            alt="Reifenregal mit eingelagerten Winter- und Sommerreifen und Lagerplatzbeschriftungen"
            active="reifen"
          >
            <TiresScreen />
          </PhotoWithWindow>
        }
      />

      <div className="border-t border-border">
        <CtaBand
          title="Alle Module. Eine Anwendung."
          text="Laden Sie KFZ Faktura herunter und bringen Sie Kunden, Fahrzeuge, Dokumente und Lager unter ein Dach."
        />
      </div>
    </>
  );
}

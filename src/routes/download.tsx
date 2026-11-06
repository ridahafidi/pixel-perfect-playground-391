import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  FileDown,
  HardDrive,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Tag,
} from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CopyButton } from "@/components/site/CopyButton";
import { DownloadButton } from "@/components/site/DownloadButton";
import { FaqList, type FaqItem } from "@/components/site/FaqList";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";
import { DOWNLOADS, PORTABLE_SHA256, SITE, LICENSE_ACCESS } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/download")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/download",
      title: "NexaFlow herunterladen – Windows Software",
      description:
        "Laden Sie NexaFlow für Windows x64 herunter. Entdecken Sie die portable Version und den klassischen Installer.",
      origin: loaderData,
    }),
  component: DownloadPage,
});

const OPTIONS = [
  { ...DOWNLOADS.portable, icon: Archive, badge: "Empfohlen zum Testen" },
  { ...DOWNLOADS.installer, icon: FileDown, badge: "Geführte Installation" },
];

const STEPS = [
  {
    title: "Version herunterladen",
    text: "Wählen Sie die portable ZIP-Version oder den klassischen Windows-Installer.",
  },
  {
    title: "Portable: ZIP-Archiv entpacken",
    text: "Entpacken Sie das Archiv vollständig in einen Ordner Ihrer Wahl. Beim Installer folgen Sie stattdessen den Schritten des Setup-Assistenten.",
  },
  {
    title: "NexaFlow.exe starten",
    text: "Starten Sie die Anwendung über „NexaFlow.exe“ im entpackten Ordner bzw. über die angelegte Verknüpfung.",
  },
  {
    title: "Lizenz & Anmeldung einrichten",
    text: "Hinterlegen Sie die Offline-Maschinenlizenz und melden Sie sich mit einem freigegebenen Google-Konto an.",
  },
];

const REQUIREMENTS: [string, string, boolean][] = [
  ["Betriebssystem", "Windows, 64-Bit (x64)", true],
  ["Windows-Mindestversion", "[WIRD ERGÄNZT]", false],
  ["Prozessor", "[WIRD ERGÄNZT]", false],
  ["Arbeitsspeicher", "[WIRD ERGÄNZT]", false],
  ["Speicherplatz", "[WIRD ERGÄNZT] · Download ca. 91–122 MB", false],
  ["Internet", "Für die Google-Anmeldung erforderlich", true],
];

const FAQ: FaqItem[] = [
  {
    q: "Was ist der Unterschied zwischen portabler Version und Installer?",
    a: "Die portable Version wird als ZIP-Archiv geliefert und nach dem Entpacken direkt gestartet – ohne klassische Installation. Der Installer richtet NexaFlow geführt auf Ihrem System ein. Funktional handelt es sich um dieselbe Anwendung in Version 1.0.0.",
  },
  {
    q: "Welche Windows-Architektur wird unterstützt?",
    a: "Beide Versionen sind für Windows x64 (64-Bit) erstellt. 32-Bit- und ARM-Systeme werden derzeit nicht angeboten.",
  },
  {
    q: "Ist eine Lizenz erforderlich?",
    a: "Ja. Für die Nutzung benötigen Sie eine gültige Offline-Maschinenlizenz, die an Ihren Rechner gebunden ist. Zusätzlich ist ein freigegebenes Google-Konto für die Anmeldung erforderlich.",
  },
  {
    q: "Warum muss die Google-Anmeldung konfiguriert werden?",
    a: "Die Anmeldung erfolgt über Google. Im aktuellen Build sind die Google-Zugangsdaten noch Platzhalter. Deshalb zeigt die Anmeldung einen Konfigurationsfehler an, bis eine korrekt konfigurierte Version bereitgestellt wird. Nur Google-Konten auf der Freigabeliste können sich anmelden.",
  },
  {
    q: "Wie kann ich das heruntergeladene Archiv prüfen?",
    a: (
      <>
        Vergleichen Sie die SHA-256-Prüfsumme der ZIP-Datei mit dem hier veröffentlichten Wert.
        Unter Windows öffnen Sie dazu PowerShell im Download-Ordner und führen{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-foreground">
          Get-FileHash .\{DOWNLOADS.portable.file} -Algorithm SHA256
        </code>{" "}
        aus. Stimmen beide Werte überein, ist die Datei unverändert.
      </>
    ),
  },
  {
    q: "Wo erhalte ich technischen Support?",
    a: (
      <>
        Nutzen Sie das{" "}
        <Link
          to="/bewertungen"
          hash="kontakt"
          className="text-foreground underline underline-offset-4"
        >
          Kontaktformular
        </Link>
        . Dort erhalten Sie auch Informationen zu konfigurierten Versionen und Lizenzen.
      </>
    ),
  },
];

function DownloadPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div
          className="bg-grid absolute inset-0 [mask-image:linear-gradient(180deg,black,transparent_80%)]"
          aria-hidden="true"
        />
        <div className="bg-glow absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 md:px-8">
          <Breadcrumbs current="Preise & Download" />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="eyebrow mb-6">Download · Windows x64</p>
              <h1 className="text-balance text-5xl font-semibold leading-[1] md:text-7xl">
                Starten Sie mit NexaFlow.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Entdecken Sie eine spezialisierte Desktop-Lösung für die Organisation Ihres
                Werkstattalltags.
              </p>
            </div>
            <a
              href="#lizenz"
              className="group flex items-start gap-4 rounded-lg border border-warning/40 bg-warning/5 p-5 transition-colors hover:border-warning"
            >
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <span className="text-sm leading-relaxed">
                <span className="font-medium">Vor dem Download beachten:</span>{" "}
                <span className="text-muted-foreground">
                  Lizenz und konfigurierte Anmeldung sind für die volle Nutzung erforderlich.
                </span>{" "}
                <span className="text-warning underline-offset-4 group-hover:underline">
                  Hinweise lesen
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-2/50 py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Neue Online-Aktivierung"
            title={LICENSE_ACCESS.title}
            intro={LICENSE_ACCESS.intro}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {LICENSE_ACCESS.steps.map((step, i) => (
              <div key={step.title} className="rounded-lg border border-border bg-background p-6">
                <p className="eyebrow">0{i + 1}</p>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{LICENSE_ACCESS.note}</p>
          <Link
            to="/bewertungen"
            hash="kontakt"
            className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Lizenz erwerben / Kontakt
          </Link>
        </div>
      </section>
      {/* DOWNLOAD CARDS */}
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 md:px-8">
          {OPTIONS.map((o, i) => {
            const Icon = o.icon;
            return (
              <Reveal
                key={o.id}
                delay={i * 120}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border bg-surface-2 p-8 transition-colors duration-500 md:p-10",
                  i === 0 ? "border-primary/50" : "border-border hover:border-foreground/30",
                )}
              >
                {i === 0 && (
                  <div className="bg-glow absolute inset-0 opacity-70" aria-hidden="true" />
                )}
                <div className="relative flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center rounded-md border border-border bg-background text-accent-ink">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {o.badge}
                  </span>
                </div>
                <p className="eyebrow relative mt-10">Option 0{i + 1}</p>
                <h2 className="relative mt-3 text-3xl font-semibold">{o.title}</h2>
                <p className="relative mt-2 text-sm text-muted-foreground">{o.product}</p>
                <p className="relative mt-6 leading-relaxed text-muted-foreground">
                  {o.description}
                </p>
                <dl className="relative mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
                  <dt className="text-muted-foreground">Datei</dt>
                  <dd className="break-all font-mono text-xs leading-5">{o.file}</dd>
                  <dt className="text-muted-foreground">Größe</dt>
                  <dd className="font-mono text-xs leading-5">{o.size}</dd>
                  <dt className="text-muted-foreground">Plattform</dt>
                  <dd className="font-mono text-xs leading-5">{SITE.platform}</dd>
                </dl>
                <div className="relative mt-auto pt-10">
                  <DownloadButton
                    option={o}
                    label={i === 0 ? "Portable ZIP herunterladen" : "Installer herunterladen"}
                    variant={i === 0 ? "hero" : "line"}
                    className="w-full"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* LICENSING DISCLOSURE */}
      <section id="lizenz" className="scroll-mt-24 border-y border-border bg-surface-2/50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <SectionHeading
            eyebrow="Wichtiger Hinweis"
            title="Lizenz & Anmeldung – transparent erklärt."
            intro="Der aktuelle Build 1.0.0 ist nicht ohne weitere Einrichtung voll nutzbar. Bitte beziehen Sie eine korrekt konfigurierte Version und eine Lizenz, bevor Sie den vollen Funktionsumfang erwarten."
          />
          <div className="space-y-4">
            {[
              {
                icon: KeyRound,
                title: "Gültige Offline-Maschinenlizenz",
                text: "Die Software benötigt eine Lizenz, die an den jeweiligen Rechner gebunden ist.",
              },
              {
                icon: UserCheck,
                title: "Freigegebenes Google-Konto",
                text: "Die Anmeldung ist nur mit einem Google-Konto möglich, das auf der Freigabeliste steht.",
              },
              {
                icon: AlertTriangle,
                title: "Google-Zugangsdaten im aktuellen Build sind Platzhalter",
                text: "Die Anmeldung zeigt deshalb einen Konfigurationsfehler, bis eine korrekt konfigurierte Version verteilt wird. Dieser Build ist nicht produktionsreif.",
                warn: true,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal
                  key={item.title}
                  delay={i * 100}
                  className={cn(
                    "flex gap-5 rounded-lg border p-6",
                    item.warn ? "border-warning/40 bg-warning/5" : "border-border bg-background",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-5 shrink-0",
                      item.warn ? "text-warning" : "text-accent-ink",
                    )}
                  />
                  <div>
                    <h3 className="font-display text-lg font-medium">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
            <Reveal className="pt-2">
              <Link
                to="/bewertungen"
                hash="kontakt"
                className="text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
              >
                Konfigurierte Version & Lizenz anfragen →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TECH INFO + INSTALL */}
      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Technische Informationen" title="Fakten zur Version." />
            <Reveal className="mt-10 overflow-hidden rounded-lg border border-border">
              <dl className="divide-y divide-border text-sm">
                {[
                  ["Plattform", "Windows x64"],
                  ["Version", SITE.version],
                  ["Distribution", "Portable ZIP / Windows-Installer"],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[10rem_1fr] gap-4 px-5 py-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[10rem_1fr] gap-4 px-5 py-4">
                  <dt className="text-muted-foreground">Integrität (ZIP)</dt>
                  <dd className="flex items-center gap-2 font-medium text-accent-ink">
                    <ShieldCheck className="size-4" /> Geprüft
                  </dd>
                </div>
                <div className="px-5 py-5">
                  <dt className="text-muted-foreground">SHA-256 · Portable ZIP</dt>
                  <dd className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-surface-2 px-3 py-2.5 font-mono text-xs leading-relaxed">
                      {PORTABLE_SHA256}
                    </code>
                    <CopyButton value={PORTABLE_SHA256} label="Prüfsumme kopieren" />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <div>
            <SectionHeading eyebrow="Installationsanleitung" title="In vier Schritten startklar." />
            <Reveal className="mt-10">
              <Accordion
                type="single"
                collapsible
                defaultValue="step-0"
                className="border-t border-border"
              >
                {STEPS.map((s, i) => (
                  <AccordionItem key={s.title} value={`step-${i}`} className="border-border">
                    <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline [&[data-state=open]_.num]:bg-primary [&[data-state=open]_.num]:text-primary-foreground">
                      <span className="flex items-center gap-4">
                        <span className="num flex size-8 shrink-0 items-center justify-center rounded-md border border-border font-mono text-xs transition-colors">
                          {i + 1}
                        </span>
                        <span className="font-display text-lg font-medium">{s.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pl-12 text-base leading-relaxed text-muted-foreground">
                      {s.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 flex gap-4 rounded-lg border border-border bg-surface-2 p-5 text-sm leading-relaxed text-muted-foreground">
                <HardDrive className="mt-0.5 size-5 shrink-0 text-accent-ink" />
                <p>
                  <span className="font-medium text-foreground">
                    Hinweis zur portablen Version:
                  </span>{" "}
                  Lassen Sie alle entpackten Dateien zusammen in einem Ordner. Die Anwendung
                  benötigt die mitgelieferten Programmressourcen – verschieben Sie nicht nur die
                  „NexaFlow.exe“.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REQUIREMENTS + PRICING (light) */}
      <section className="theme-paper py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Systemanforderungen"
              title="Was Ihr Rechner mitbringen sollte."
            />
            <Reveal className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <caption className="sr-only">Systemanforderungen für NexaFlow</caption>
                <tbody className="divide-y divide-border">
                  {REQUIREMENTS.map(([k, v, verified]) => (
                    <tr key={k}>
                      <th
                        scope="row"
                        className="w-1/3 px-5 py-4 text-left font-normal text-muted-foreground"
                      >
                        {k}
                      </th>
                      <td
                        className={cn(
                          "px-5 py-4",
                          verified ? "font-medium" : "font-mono text-xs text-muted-foreground",
                        )}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
            <p className="mt-4 text-xs text-muted-foreground">
              Mit [WIRD ERGÄNZT] markierte Angaben werden nach abschließender Prüfung
              veröffentlicht.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Preise" title="Lizenzmodell." />
            <Reveal className="mt-10 rounded-lg border border-border bg-card p-8">
              <Tag className="size-5 text-accent-ink" />
              <p className="mt-6 font-display text-2xl font-semibold">Preise auf Anfrage</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Das Lizenzmodell und die Preise für NexaFlow werden derzeit festgelegt. Sprechen
                Sie uns an – wir informieren Sie über Lizenzen und konfigurierte Versionen.
              </p>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                [PREISANGABEN_PLATZHALTER]
              </p>
              <Link
                to="/bewertungen"
                hash="kontakt"
                className="mt-8 inline-flex h-11 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
              >
                Lizenz anfragen
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DOWNLOAD FAQ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <SectionHeading eyebrow="Download-FAQ" title="Fragen zum Download." />
          <Reveal>
            <FaqList items={FAQ} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

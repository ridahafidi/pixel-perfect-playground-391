import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Package,
  CircleDot,
  Search,
  Minus,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleKey = "dashboard" | "kunden" | "fahrzeuge" | "rechnungen" | "ersatzteile" | "reifen";

const MODULES: { key: ModuleKey; label: string; icon: typeof Users }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "kunden", label: "Kunden", icon: Users },
  { key: "fahrzeuge", label: "Fahrzeuge", icon: Car },
  { key: "rechnungen", label: "Dokumente", icon: FileText },
  { key: "ersatzteile", label: "Ersatzteile", icon: Package },
  { key: "reifen", label: "Reifenlager", icon: CircleDot },
];

const TITLES: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  kunden: "Kunden",
  fahrzeuge: "Fahrzeuge",
  rechnungen: "Dokumente & Rechnungen",
  ersatzteile: "Ersatzteillager",
  reifen: "Reifenlager",
};

type Props = {
  active: ModuleKey;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

/** Illustrative desktop window frame, based on the documented KFZ Faktura modules. */
export function AppWindow({ active, children, className, compact }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface-2 text-foreground shadow-window",
        className,
      )}
      role="img"
      aria-label={`Illustrative Darstellung der KFZ Faktura Oberfläche: ${TITLES[active]}`}
    >
      {/* Title bar */}
      <div className="flex h-8 items-center justify-between border-b border-border bg-background/60 pl-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-primary" />
          <span className="font-medium tracking-wide">KFZ Faktura</span>
          <span className="hidden opacity-60 sm:inline">— {TITLES[active]}</span>
        </div>
        <div className="flex h-full items-stretch">
          <span className="flex w-9 items-center justify-center"><Minus className="size-3" /></span>
          <span className="flex w-9 items-center justify-center"><Square className="size-2.5" /></span>
          <span className="flex w-9 items-center justify-center"><X className="size-3" /></span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 border-r border-border bg-sidebar py-3",
            compact ? "w-11" : "w-11 sm:w-40",
          )}
        >
          <ul className="space-y-0.5 px-1.5">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isActive = m.key === active;
              return (
                <li
                  key={m.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-2 py-1.5 text-[11px]",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0", isActive && "text-sidebar-primary")} />
                  <span className={cn("truncate", compact ? "hidden" : "hidden sm:inline")}>{m.label}</span>
                  {isActive && !compact && (
                    <span className="ml-auto hidden h-3 w-0.5 rounded bg-sidebar-primary sm:block" />
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <h3 className="font-display text-sm font-semibold tracking-tight">{TITLES[active]}</h3>
            <div className="flex items-center gap-1.5 rounded border border-border bg-background/50 px-2 py-1 text-[10px] text-muted-foreground">
              <Search className="size-3" />
              <span className="hidden sm:inline">Suchen …</span>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */

export function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded border border-border bg-background/40 p-2.5">
      <p className="text-[9.5px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-semibold sm:text-base", accent && "text-primary")}>{value}</p>
      {hint && <p className="mt-0.5 text-[9.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Chip({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "lime" | "warn" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide",
        tone === "muted" && "bg-surface text-muted-foreground",
        tone === "lime" && "bg-primary/15 text-primary",
        tone === "warn" && "bg-warning/15 text-warning",
        tone === "danger" && "bg-destructive/15 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

function Table({ head, rows, align }: { head: string[]; rows: ReactNode[][]; align?: ("l" | "r")[] }) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-[10.5px]">
        <thead className="bg-background/50 text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={cn("px-2.5 py-1.5 font-medium", align?.[i] === "r" ? "text-right" : "text-left", i > 2 && "hidden md:table-cell")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-border">
              {r.map((c, ci) => (
                <td
                  key={ci}
                  className={cn("px-2.5 py-1.5", align?.[ci] === "r" ? "text-right font-mono" : "text-left", ci > 2 && "hidden md:table-cell")}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Screens ---------- */

const BARS = [42, 55, 48, 63, 58, 71, 66, 78, 69, 84, 76, 92];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function DashboardScreen({ animate = true }: { animate?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Kpi label="Umsatz (Monat)" value="24.860 €" hint="+8,2 % ggü. Vormonat" accent />
        <Kpi label="Offene Rechnungen" value="7" hint="5.412 € ausstehend" />
        <Kpi label="Kunden" value="312" hint="4 neu diese Woche" />
        <Kpi label="Fahrzeuge" value="438" hint="verknüpft" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded border border-border bg-background/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Umsatzübersicht</p>
            <Chip tone="lime">2026</Chip>
          </div>
          <div className="flex h-24 items-end gap-1.5">
            {BARS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full origin-bottom rounded-[2px]",
                    i === BARS.length - 1 ? "bg-primary" : "bg-primary/35",
                    animate && "animate-grow",
                  )}
                  style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                />
                <span className="text-[8px] text-muted-foreground">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-border bg-background/40 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Werkstattaktivität</p>
          <ul className="space-y-2 text-[10.5px]">
            <li className="flex items-center justify-between gap-2">
              <span className="truncate">RE-2026-0142 erstellt</span>
              <Chip tone="lime">Rechnung</Chip>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="truncate">AU-0387 · Inspektion</span>
              <Chip>Auftrag</Chip>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="truncate">Bremsbeläge VA</span>
              <Chip tone="warn">Mindestbestand</Chip>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="truncate">AN-0219 · Zahnriemen</span>
              <Chip>Angebot</Chip>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function CustomersScreen() {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1.3fr]">
      <ul className="space-y-1 text-[10.5px]">
        {[
          ["Becker, Jonas", "2 Fahrzeuge"],
          ["Autohaus Krämer GmbH", "6 Fahrzeuge"],
          ["Schulz, Miriam", "1 Fahrzeug"],
          ["Yilmaz, Deniz", "2 Fahrzeuge"],
          ["Hoffmann, Petra", "1 Fahrzeug"],
        ].map(([n, v], i) => (
          <li
            key={n}
            className={cn(
              "flex items-center justify-between rounded border px-2.5 py-2",
              i === 0 ? "border-primary/50 bg-primary/5" : "border-border bg-background/40",
            )}
          >
            <span className="font-medium">{n}</span>
            <span className="text-muted-foreground">{v}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2.5 rounded border border-border bg-background/40 p-3 text-[10.5px]">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold">Becker, Jonas</p>
          <Chip tone="lime">Stammkunde</Chip>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
          <span>Kundennr.</span><span className="font-mono text-foreground">K-10482</span>
          <span>Telefon</span><span className="font-mono text-foreground">0151 ••• ••42</span>
          <span>Ort</span><span className="text-foreground">Musterstadt</span>
        </div>
        <p className="pt-1 text-[9.5px] uppercase tracking-wider text-muted-foreground">Verknüpfte Fahrzeuge</p>
        {[
          ["VW Golf VIII", "MS-JB 412", "0603 / BKR"],
          ["Škoda Octavia", "MS-JB 87", "8004 / AHT"],
        ].map(([m, p, h]) => (
          <div key={p} className="flex items-center justify-between rounded border border-border px-2.5 py-1.5">
            <span className="flex items-center gap-2"><Car className="size-3 text-primary" />{m}</span>
            <span className="font-mono text-muted-foreground">{p}</span>
            <span className="hidden font-mono text-muted-foreground lg:inline">{h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VehicleScreen() {
  return (
    <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-2 rounded border border-border bg-background/40 p-3 text-[10.5px]">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold">VW Golf VIII · 1.5 eTSI</p>
          <span className="rounded-sm border border-border px-1.5 py-0.5 font-mono">MS-JB 412</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-muted-foreground">
          <span>FIN / VIN</span><span className="font-mono text-foreground">WVWZZZCDZMW••••21</span>
          <span>HSN</span><span className="font-mono text-foreground">0603</span>
          <span>TSN</span><span className="font-mono text-foreground">BKR</span>
          <span>Erstzulassung</span><span className="font-mono text-foreground">03/2021</span>
          <span>Halter</span><span className="text-foreground">Becker, Jonas · K-10482</span>
        </div>
      </div>
      <div className="space-y-1.5 text-[10.5px]">
        <p className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Vorgänge</p>
        {[
          ["RE-2026-0142", "Inspektion", "lime"],
          ["AU-0387", "Bremsen VA", "muted"],
          ["AN-0201", "Reifenwechsel", "muted"],
        ].map(([n, t, tone]) => (
          <div key={n} className="flex items-center justify-between rounded border border-border bg-background/40 px-2.5 py-1.5">
            <span className="font-mono">{n}</span>
            <span className="text-muted-foreground">{t}</span>
            <Chip tone={tone as "lime" | "muted"}>{(n ?? "").slice(0, 2)}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvoicesScreen() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        {["Alle", "Angebote", "Aufträge", "Rechnungen"].map((t, i) => (
          <span key={t} className={cn("rounded-sm border px-2 py-1", i === 3 ? "border-primary/60 text-primary" : "border-border text-muted-foreground")}>
            {t}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-1 font-medium text-primary-foreground">
          Auftrag → Rechnung
        </span>
      </div>
      <Table
        head={["Nr.", "Kunde", "Betrag", "Typ", "Status"]}
        align={["l", "l", "r", "l", "l"]}
        rows={[
          ["RE-2026-0142", "Becker, J.", "486,20 €", <Chip key="a" tone="lime">Rechnung</Chip>, <Chip key="b" tone="warn">Offen</Chip>],
          ["RE-2026-0141", "Krämer GmbH", "1.932,00 €", <Chip key="a" tone="lime">Rechnung</Chip>, <Chip key="b">Bezahlt</Chip>],
          ["AU-0387", "Schulz, M.", "312,90 €", <Chip key="a">Auftrag</Chip>, <Chip key="b">In Arbeit</Chip>],
          ["AN-0219", "Yilmaz, D.", "724,50 €", <Chip key="a">Angebot</Chip>, <Chip key="b">Versendet</Chip>],
          ["RE-2026-0138", "Hoffmann, P.", "158,40 €", <Chip key="a" tone="lime">Rechnung</Chip>, <Chip key="b" tone="danger">Überfällig</Chip>],
        ]}
      />
    </div>
  );
}

export function PartsScreen() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Artikel" value="1.284" />
        <Kpi label="Lagerwert (EK)" value="38.410 €" />
        <Kpi label="Unter Minimum" value="3" accent />
      </div>
      <Table
        head={["Art.-Nr.", "Bezeichnung", "Bestand", "EK", "VK", "Min."]}
        align={["l", "l", "r", "r", "r", "r"]}
        rows={[
          ["BB-4471", "Bremsbeläge VA", <span key="s" className="text-warning">2</span>, "38,90 €", "64,90 €", "4"],
          ["OF-1102", "Ölfilter", "18", "6,20 €", "12,90 €", "10"],
          ["ZR-0930", "Zahnriemensatz", "5", "112,00 €", "189,00 €", "2"],
          ["WB-2203", "Wischerblatt 600 mm", <span key="s" className="text-warning">1</span>, "8,40 €", "17,50 €", "6"],
          ["LF-7710", "Luftfilter", "12", "9,80 €", "19,90 €", "5"],
        ]}
      />
    </div>
  );
}

export function TiresScreen() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Eingelagert" value="146 Sätze" />
        <Kpi label="Winter" value="92" accent />
        <Kpi label="Freie Plätze" value="28" />
      </div>
      <Table
        head={["Kunde", "Kennz.", "Saison", "Dimension", "Profil", "Lagerplatz"]}
        align={["l", "l", "l", "l", "r", "l"]}
        rows={[
          ["Becker, J.", "MS-JB 412", <Chip key="s" tone="lime">Winter</Chip>, "205/55 R16", "6,5 mm", <span key="p" className="font-mono">R2-04</span>],
          ["Schulz, M.", "MS-MS 19", <Chip key="s">Sommer</Chip>, "195/65 R15", "5,8 mm", <span key="p" className="font-mono">R1-11</span>],
          ["Krämer GmbH", "MS-AK 300", <Chip key="s" tone="lime">Winter</Chip>, "225/45 R17", <span key="t" className="text-warning">3,1 mm</span>, <span key="p" className="font-mono">R3-02</span>],
          ["Yilmaz, D.", "MS-DY 77", <Chip key="s">Sommer</Chip>, "215/60 R16", "7,0 mm", <span key="p" className="font-mono">R1-03</span>],
        ]}
      />
    </div>
  );
}

export function ModuleScreen({ module }: { module: ModuleKey }) {
  switch (module) {
    case "dashboard":
      return <DashboardScreen />;
    case "kunden":
      return <CustomersScreen />;
    case "fahrzeuge":
      return <VehicleScreen />;
    case "rechnungen":
      return <InvoicesScreen />;
    case "ersatzteile":
      return <PartsScreen />;
    case "reifen":
      return <TiresScreen />;
  }
}

import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";
import { LanguagePicker } from "./LanguagePicker";

const COLUMNS = [
  {
    title: "Produkt",
    links: [
      { label: "Startseite", to: "/" },
      { label: "Funktionen", to: "/funktionen" },
      { label: "Download", to: "/download" },
    ],
  },
  {
    title: "Informationen",
    links: [
      { label: "Bewertungen", to: "/bewertungen" },
      { label: "Über NexaFlow", to: "/bewertungen", hash: "ueber" },
      { label: "Kontakt", to: "/bewertungen", hash: "kontakt" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { label: "Impressum", to: "/impressum" },
      { label: "Datenschutz", to: "/datenschutz" },
      { label: "Nutzungsbedingungen", to: "/nutzungsbedingungen" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface-2">
      <div className="stripe h-1 w-full opacity-60" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">{SITE.tagline}</p>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            Version {SITE.version} · {SITE.platform}
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {col.title}
            </h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    {...("hash" in l ? { hash: l.hash } : {})}
                    className="text-sm text-foreground/85 transition-colors hover:text-accent-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 NexaFlow. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4">
            <p className="font-mono">Werkstattsoftware für Windows</p>
            <LanguagePicker side="top" />
          </div>
        </div>
      </div>
    </footer>
  );
}


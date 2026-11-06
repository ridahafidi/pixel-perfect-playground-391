import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, CreditCard, Lock, Monitor, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";
import { PRICE, SITE } from "@/lib/site";

export const Route = createFileRoute("/kaufen")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/kaufen",
      title: "NEXAFLOW kaufen – Lizenz für $150",
      description:
        "Kaufen Sie Ihre NEXAFLOW Lizenz für Windows: einmalig $150, ein Lizenzschlüssel für einen Rechner.",
      origin: loaderData,
    }),
  component: CheckoutPage,
});

const INCLUDED = [
  "NEXAFLOW 1.0.0 für Windows x64",
  "Persönlicher Lizenzschlüssel per E-Mail",
  "Aktivierung auf einem Rechner",
  "Portable Version und Installer",
];

function CheckoutPage() {
  const [busy, setBusy] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      toast("Online-Zahlung wird gerade eingerichtet", {
        description:
          "Es wurde nichts belastet. Bitte kontaktieren Sie uns, um Ihre Lizenz jetzt zu erwerben.",
      });
    }, 600);
  };

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="bg-glow absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <Breadcrumbs current="Kaufen" />
        <h1 className="text-4xl font-semibold md:text-6xl">Lizenz kaufen.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Einmal zahlen, dauerhaft nutzen. Nach bestätigter Zahlung erhalten Sie Ihren
          Lizenzschlüssel an Ihre E-Mail-Adresse.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={submit}
            className="space-y-8 rounded-xl border border-border bg-surface-2 p-6 md:p-8"
          >
            <fieldset className="space-y-5">
              <legend className="flex items-center gap-2 text-lg font-semibold">
                <Mail className="size-5 text-accent-ink" /> Ihre Angaben
              </legend>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buyer-name">Vollständiger Name</Label>
                  <Input id="buyer-name" name="name" autoComplete="name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-company">Werkstatt / Firma (optional)</Label>
                  <Input id="buyer-company" name="company" autoComplete="organization" maxLength={160} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer-email">E-Mail-Adresse</Label>
                <Input id="buyer-email" name="email" type="email" autoComplete="email" required maxLength={254} />
                <p className="text-xs text-muted-foreground">
                  Diese Adresse wird für Ihre Lizenz freigeschaltet.
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="size-5 text-accent-ink" /> Zahlung
              </legend>
              <div className="rounded-lg border border-dashed border-border bg-background/60 p-5 text-sm text-muted-foreground">
                Die sichere Kartenzahlung wird hier angezeigt, sobald der Zahlungsanbieter verbunden
                ist. Ihre Kartendaten werden niemals auf dieser Website gespeichert.
              </div>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" required className="mt-1 accent-[var(--primary)]" />
                <span>
                  Ich akzeptiere die{" "}
                  <Link to="/nutzungsbedingungen" className="text-foreground underline underline-offset-4">
                    Nutzungsbedingungen
                  </Link>{" "}
                  und habe die{" "}
                  <Link to="/datenschutz" className="text-foreground underline underline-offset-4">
                    Datenschutzerklärung
                  </Link>{" "}
                  gelesen.
                </span>
              </label>
            </fieldset>

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
              <Lock />
              {busy ? "Wird vorbereitet …" : `Jetzt bezahlen – ${PRICE.label}`}
            </Button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> Verschlüsselte Verbindung · Einmalzahlung, kein Abo
            </p>
          </form>

          <aside className="h-fit rounded-xl border border-primary/40 bg-surface-2 p-6 md:p-8 lg:sticky lg:top-28">
            <p className="eyebrow">Bestellübersicht</p>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold">{SITE.name} Lizenz</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Version {SITE.version} · {SITE.platform}
                </p>
              </div>
              <Monitor className="size-6 text-accent-ink" />
            </div>
            <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                  {item}
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Zwischensumme</dt>
                <dd>{PRICE.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Steuern</dt>
                <dd className="text-muted-foreground">an der Kasse berechnet</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <dt>Gesamt</dt>
                <dd>{PRICE.label} USD</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

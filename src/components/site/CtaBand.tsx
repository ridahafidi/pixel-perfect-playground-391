import { Link } from "@tanstack/react-router";
import { ArrowRight, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOWNLOADS, SITE } from "@/lib/site";
import { DownloadButton } from "./DownloadButton";
import { Reveal } from "./Reveal";

type Props = {
  title?: string;
  text?: string;
  ctaLabel?: string;
  showDetailsLink?: boolean;
};

/** Reusable download call-to-action band. */
export function CtaBand({
  title = "Bringen Sie Struktur in Ihren Werkstattalltag.",
  text = "Entdecken Sie NexaFlow und organisieren Sie Ihre Werkstattverwaltung mit einer spezialisierten Desktop-Lösung.",
  ctaLabel = "NexaFlow herunterladen",
  showDetailsLink = true,
}: Props) {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-xl border border-border bg-surface-2">
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="bg-glow absolute inset-0" aria-hidden="true" />
        <div className="relative grid gap-12 p-8 md:p-14 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:p-20">
          <div>
            <p className="eyebrow mb-6">Download · Version {SITE.version}</p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.02] md:text-6xl">{title}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{text}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <DownloadButton option={DOWNLOADS.portable} label={ctaLabel} />
              {showDetailsLink && (
                <Button asChild variant="line" size="xl">
                  <Link to="/download">
                    Versionen & Hinweise
                    <ArrowRight />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm">
            {[
              ["Plattform", SITE.platform],
              ["Version", SITE.version],
              ["Portable", DOWNLOADS.portable.size],
              ["Installer", DOWNLOADS.installer.size],
            ].map(([k, v]) => (
              <div key={k} className="bg-background/80 p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
                <dd className="mt-2 font-display text-lg font-medium">{v}</dd>
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-3 bg-background/80 p-5 text-muted-foreground">
              <MonitorDown className="size-5 text-accent-ink" />
              <span className="text-xs leading-relaxed">
                Lizenz und Anmeldung erforderlich – Details auf der Download-Seite.
              </span>
            </div>
          </dl>
        </div>
      </Reveal>
    </section>
  );
}


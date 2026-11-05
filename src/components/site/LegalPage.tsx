import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

/** Shared layout for legal pages. Content stays clearly marked as placeholder until verified. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-28 pb-24 md:pt-36 md:pb-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Breadcrumbs current={title} />
        <h1 className="text-5xl font-semibold md:text-6xl">{title}</h1>
        <div className="mt-10 flex gap-4 rounded-lg border border-warning/40 bg-warning/5 p-5 text-sm leading-relaxed">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <p>
            <span className="font-medium">Platzhalter:</span>{" "}
            <span className="text-muted-foreground">
              Diese Seite enthält noch keine rechtsverbindlichen Angaben. Die Inhalte werden vor Veröffentlichung durch
              verifizierte Informationen ersetzt.
            </span>
          </p>
        </div>
        <div className="mt-12 space-y-10 text-muted-foreground [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground [&_p]:mt-3 [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

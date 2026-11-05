import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/datenschutz")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/datenschutz",
      title: "Datenschutzerklärung – KFZ Faktura",
      description: "Informationen zur Verarbeitung personenbezogener Daten auf der Website von KFZ Faktura.",
      origin: loaderData,
      noindex: true,
    }),
  component: () => (
    <LegalPage title="Datenschutz">
      <div>
        <h2>1. Verantwortliche Stelle</h2>
        <p className="font-mono text-sm">[NAME UND ANSCHRIFT DES VERANTWORTLICHEN]</p>
      </div>
      <div>
        <h2>2. Erhobene Daten beim Besuch der Website</h2>
        <p className="font-mono text-sm">[BESCHREIBUNG: SERVER-LOGS, HOSTING, SCHRIFTARTEN]</p>
      </div>
      <div>
        <h2>3. Kontaktformular</h2>
        <p className="font-mono text-sm">[ZWECK, RECHTSGRUNDLAGE, SPEICHERDAUER]</p>
      </div>
      <div>
        <h2>4. Ihre Rechte</h2>
        <p className="font-mono text-sm">[AUSKUNFT, BERICHTIGUNG, LÖSCHUNG, WIDERSPRUCH, BESCHWERDERECHT]</p>
      </div>
    </LegalPage>
  ),
});

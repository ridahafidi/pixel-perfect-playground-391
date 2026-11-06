import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/nutzungsbedingungen")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/nutzungsbedingungen",
      title: "Nutzungsbedingungen – NEXAFLOW",
      description: "Nutzungs- und Lizenzbedingungen für die Software NEXAFLOW.",
      origin: loaderData,
      noindex: true,
    }),
  component: () => (
    <LegalPage title="Nutzungsbedingungen">
      <div>
        <h2>1. Geltungsbereich</h2>
        <p className="font-mono text-sm">[GELTUNGSBEREICH DER NUTZUNGSBEDINGUNGEN]</p>
      </div>
      <div>
        <h2>2. Lizenz und Nutzungsrechte</h2>
        <p className="font-mono text-sm">[LIZENZUMFANG, MASCHINENBINDUNG, LAUFZEIT]</p>
      </div>
      <div>
        <h2>3. Haftung und Gewährleistung</h2>
        <p className="font-mono text-sm">[HAFTUNGSREGELUNGEN]</p>
      </div>
    </LegalPage>
  ),
});

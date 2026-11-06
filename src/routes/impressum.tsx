import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/impressum")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) =>
    seo({
      path: "/impressum",
      title: "Impressum – NexaFlow",
      description: "Impressum und Anbieterkennzeichnung von NexaFlow.",
      origin: loaderData,
      noindex: true,
    }),
  component: () => (
    <LegalPage title="Impressum">
      <div>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p className="font-mono text-sm">
          [FIRMENNAME]
          <br />
          [STRASSE, HAUSNUMMER]
          <br />
          [PLZ, ORT]
        </p>
      </div>
      <div>
        <h2>Vertreten durch</h2>
        <p className="font-mono text-sm">[VERTRETUNGSBERECHTIGTE PERSON]</p>
      </div>
      <div>
        <h2>Kontakt</h2>
        <p className="font-mono text-sm">
          Telefon: [TELEFON]
          <br />
          E-Mail: [E-MAIL]
        </p>
      </div>
      <div>
        <h2>Registereintrag & Umsatzsteuer-ID</h2>
        <p className="font-mono text-sm">[REGISTERGERICHT / REGISTERNUMMER / UST-IDNR.]</p>
      </div>
    </LegalPage>
  ),
});


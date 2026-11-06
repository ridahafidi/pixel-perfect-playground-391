import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";
import { pageText, type PageKey } from "@/lib/page-translations";
import { DownloadButton } from "@/components/site/DownloadButton";
import { ContactForm } from "@/components/site/ContactForm";
import { DOWNLOADS } from "@/lib/site";

const featurePairs: [PageKey, PageKey][] = [
  ["dashboard","dashboardText"],["customers","customersText"],["vehicles","vehiclesText"],
  ["invoices","invoicesText"],["parts","partsText"],["tires","tiresText"],
];

export function LocalizedFeatures() {
  const { locale, t } = useLanguage();
  const p = (key: PageKey) => pageText(locale, key);
  return <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8">
    <p className="eyebrow">{p("features")}</p>
    <h1 className="mt-6 max-w-4xl text-5xl font-semibold md:text-7xl">{p("featuresTitle")}</h1>
    <p className="mt-7 max-w-3xl text-lg text-muted-foreground">{p("featuresIntro")}</p>
    <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {featurePairs.map(([title, description]) => <section key={title} className="rounded-lg border border-border bg-surface-2 p-8">
        <h2 className="text-2xl font-semibold">{p(title)}</h2>
        <p className="mt-4 text-muted-foreground">{p(description)}</p>
      </section>)}
    </div>
    <Link to="/download" className="mt-12 inline-flex rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">{t("download")}</Link>
  </div>;
}

export function LocalizedDownload() {
  const { locale, t } = useLanguage();
  const p = (key: PageKey) => pageText(locale, key);
  return <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8">
    <p className="eyebrow">{p("download")}</p>
    <h1 className="mt-6 text-5xl font-semibold md:text-7xl">{p("downloadTitle")}</h1>
    <p className="mt-7 max-w-3xl text-lg text-muted-foreground">{p("downloadIntro")}</p>
    <div className="mt-14 grid gap-6 md:grid-cols-2">
      {[DOWNLOADS.portable, DOWNLOADS.installer].map((option) => <section key={option.id} className="rounded-lg border border-border bg-surface-2 p-8">
        <h2 className="text-2xl font-semibold">{option.title}</h2>
        <p className="mt-3 text-muted-foreground">{option.product} · {option.size}</p>
        <div className="mt-8"><DownloadButton option={option} label={t("download")} /></div>
      </section>)}
    </div>
  </div>;
}

export function LocalizedReviews() {
  const { locale } = useLanguage();
  const p = (key: PageKey) => pageText(locale, key);
  return <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8">
    <p className="eyebrow">{p("reviews")}</p>
    <h1 className="mt-6 text-5xl font-semibold md:text-7xl">{p("reviewsTitle")}</h1>
    <p className="mt-7 max-w-3xl text-lg text-muted-foreground">{p("reviewsIntro")}</p>
    <section id="kontakt" className="mt-16 scroll-mt-24">
      <h2 className="text-3xl font-semibold">{p("contact")}</h2>
      <p className="mt-3 text-muted-foreground">{p("contactIntro")}</p>
      <div className="mt-8"><ContactForm /></div>
    </section>
  </div>;
}

type SeoInput = {
  path: string;
  title: string;
  description: string;
  origin?: string;
  noindex?: boolean;
};

/** Builds the per-route head() payload: title, description, OG, Twitter, canonical. */
export function seo({ path, title, description, origin, noindex }: SeoInput) {
  const canonical = origin ? `${origin}${path}` : undefined;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "de_DE" },
    { property: "og:site_name", content: "KFZ Faktura" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (canonical) meta.push({ property: "og:url", content: canonical });
  if (noindex) meta.push({ name: "robots", content: "noindex, follow" });

  const links = canonical ? [{ rel: "canonical", href: canonical }] : [];
  return { meta, links };
}

export const SITE_ROUTES = [
  "/",
  "/funktionen",
  "/download",
  "/bewertungen",
  "/impressum",
  "/datenschutz",
  "/nutzungsbedingungen",
] as const;

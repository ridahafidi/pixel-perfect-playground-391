/**
 * Central product facts for the KFZ Faktura marketing site.
 * Values wrapped in [BRACKETS] are unconfirmed placeholders and must be
 * replaced with verified information before launch.
 */

export const SITE = {
  name: "KFZ Faktura",
  tagline: "Die Werkstattverwaltung übersichtlich organisiert.",
  version: "1.0.0",
  platform: "Windows x64",
  contactEmail: "[KONTAKT_E-MAIL]",
  supportInfo: "[SUPPORT-INFORMATIONEN]",
} as const;

export const NAV_ITEMS = [
  { to: "/", label: "Startseite" },
  { to: "/funktionen", label: "Funktionen" },
  { to: "/download", label: "Preise & Download" },
  { to: "/bewertungen", label: "Bewertungen" },
] as const;

/** Placeholder until real download URLs are provided. */
export const PLACEHOLDER_URL_PREFIX = "[";

export const DOWNLOADS = {
  portable: {
    id: "portable",
    title: "Portable Version",
    product: "KFZ Faktura 1.0.0 — Windows x64 Portable",
    file: "KFZ-Faktura-1.0.0-win-x64-portable.zip",
    size: "ca. 122 MB",
    url: "[PORTABLE_DOWNLOAD_URL]",
    description:
      "Die portable Version enthält die vollständige Anwendungsumgebung und kann nach dem Entpacken gestartet werden.",
  },
  installer: {
    id: "installer",
    title: "Installer",
    product: "KFZ Faktura Setup 1.0.0",
    file: "KFZ Faktura Setup 1.0.0.exe",
    size: "ca. 91 MB",
    url: "[INSTALLER_DOWNLOAD_URL]",
    description: "Die klassische Windows-Installationsversion für eine geführte Installation.",
  },
} as const;

export type DownloadOption = (typeof DOWNLOADS)[keyof typeof DOWNLOADS];

export const PORTABLE_SHA256 =
  "988e17f1667dd903ba75040a1c00ebc0cb77ea5cedb029cc3b5dd38278e5c32c";

export function isPlaceholderUrl(url: string) {
  return url.trim() === "" || url.startsWith(PLACEHOLDER_URL_PREFIX);
}

export type Review = {
  quote: string;
  author: string;
  business?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  source: string;
  sourceUrl?: string;
  verified: boolean;
};

/**
 * Only add genuine, attributable reviews here. While empty, the reviews page
 * shows an honest invitation instead of testimonials.
 */
export const REVIEWS: Review[] = [];

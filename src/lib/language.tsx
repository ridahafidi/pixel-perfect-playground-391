import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Locale, type TranslationKey } from "./translations";

const supported = new Set(["de","en","fr","es","it","pt","nl","pl","tr","ro","ru","uk","ar","zh"]);
const storageKey = "nexaflow.locale";
function initialLocale(): Locale {
  if (typeof window === "undefined") return "de";
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && supported.has(stored)) return stored as Locale;
  } catch { /* private browsing */ }
  return "de";
}
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de");
  useEffect(() => { setLocale(initialLocale()); }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try { window.localStorage.setItem(storageKey, locale); } catch { /* unavailable */ }
  }, [locale]);
  return <LanguageContext.Provider value={{ locale, setLocale, t: (key) => translate(locale, key) }}>
    {children}
  </LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be inside LanguageProvider");
  return context;
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Whole-page translation: German is the source text in the markup; for any other
 * language every visible text node and key attribute is swapped from the
 * matching dictionary in ./locales. Originals are remembered so switching back
 * (or to another language) always starts from the German source.
 */

export const LANG_STORAGE_KEY = "nexaflow-lang";
export const RTL_LANGS = new Set(["ar"]);
const ATTRS = ["aria-label", "placeholder", "title", "alt"] as const;

const loaders = import.meta.glob<{ default: Record<string, string> }>("./locales/*.json");

type Ctx = { lang: string; setLang: (lang: string) => void };
const LanguageContext = createContext<Ctx>({ lang: "de", setLang: () => {} });
export const useLanguage = () => useContext(LanguageContext);

const originalText = new WeakMap<Text, string>();
const lastWritten = new WeakMap<Text, string>();
const originalAttr = new WeakMap<Element, Record<string, string>>();

function translateValue(source: string, dict: Record<string, string> | null) {
  if (!dict) return source;
  const trimmed = source.trim().replace(/\s+/g, " ");
  if (!trimmed) return source;
  const hit = dict[trimmed];
  if (!hit) return source;
  const lead = source.match(/^\s*/)?.[0] ?? "";
  const trail = source.match(/\s*$/)?.[0] ?? "";
  return lead + hit + trail;
}

function skip(el: Element | null) {
  return !!el?.closest("script,style,code,pre,[data-no-translate]");
}

function applyTo(root: Node, dict: Record<string, string> | null) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node: Node | null = root;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node as Text;
      if (!skip(t.parentElement)) {
        let orig = originalText.get(t);
        // React may have replaced the text since we last wrote it: treat as new source.
        if (orig === undefined || t.data !== lastWritten.get(t)) {
          orig = t.data;
          originalText.set(t, orig);
        }
        const next = translateValue(orig, dict);
        if (t.data !== next) t.data = next;
        lastWritten.set(t, next);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (!skip(el)) {
        let store = originalAttr.get(el);
        if (!store) {
          store = {};
          originalAttr.set(el, store);
        }
        for (const a of ATTRS) {
          const current = el.getAttribute(a);
          if (current === null) continue;
          if (store[a] === undefined || (current !== store[a] && current !== store[`__${a}`])) {
            store[a] = current;
          }
          const next = translateValue(store[a]!, dict);
          store[`__${a}`] = next;
          if (current !== next) el.setAttribute(a, next);
        }
      }
    }
    node = walker.nextNode();
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("de");
  const [dict, setDict] = useState<Record<string, string> | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && saved !== "de") setLangState(saved);
  }, []);

  useEffect(() => {
    let active = true;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
    if (lang === "de") {
      setDict(null);
      return;
    }
    const loader = loaders[`./locales/${lang}.json`];
    loader?.().then((m) => active && setDict(m.default));
    return () => {
      active = false;
    };
  }, [lang]);

  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        observer.disconnect();
        applyTo(document.body, dict);
        observer.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: [...ATTRS],
        });
      });
    };
    const observer = new MutationObserver(run);
    run();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [dict, pathname]);

  const setLang = useCallback((next: string) => {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
    setLangState(next);
  }, []);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

/** Counts a page view for the admin analytics (no cookies, no personal data stored). */
export function usePageViewTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    fetch("/api/licensing/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
}

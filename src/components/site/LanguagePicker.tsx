import { useState } from "react";
import { Check, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type Language = {
  code: string;
  native: string;
  label: string;
  available: boolean;
  rtl?: boolean;
};

/** Most-used market languages. Only German content exists today. */
export const LANGUAGES: Language[] = [
  { code: "de", native: "Deutsch", label: "German", available: true },
  { code: "en", native: "English", label: "English", available: true },
  { code: "fr", native: "Français", label: "French", available: false },
  { code: "es", native: "Español", label: "Spanish", available: false },
  { code: "it", native: "Italiano", label: "Italian", available: false },
  { code: "pt", native: "Português", label: "Portuguese", available: false },
  { code: "nl", native: "Nederlands", label: "Dutch", available: false },
  { code: "pl", native: "Polski", label: "Polish", available: false },
  { code: "tr", native: "Türkçe", label: "Turkish", available: false },
  { code: "ro", native: "Română", label: "Romanian", available: false },
  { code: "ru", native: "Русский", label: "Russian", available: false },
  { code: "uk", native: "Українська", label: "Ukrainian", available: false },
  { code: "ar", native: "العربية", label: "Arabic", available: false, rtl: true },
  { code: "zh", native: "中文", label: "Chinese", available: false },
];

type Props = { className?: string; align?: "start" | "end"; side?: "top" | "bottom"; full?: boolean };

export function LanguagePicker({ className, align = "end", side = "bottom", full }: Props) {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  const choose = (lang: Language) => {
    setLocale(lang.code as typeof locale);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${t("choose")} – ${current.native}`}
          className={cn(
            "group inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground data-[state=open]:border-primary data-[state=open]:text-foreground",
            full && "h-12 w-full justify-between px-4 text-sm",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <Globe className="size-4" />
            <span className="font-mono uppercase tracking-[0.14em]">{current.code}</span>
            {full && <span className="text-foreground">{current.native}</span>}
          </span>
          <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={10}
        className="w-[min(92vw,30rem)] overflow-hidden rounded-lg border-border bg-surface-2 p-0 shadow-float"
      >
        <div className="flex items-end justify-between border-b border-border px-5 py-4">
          <div>
            <p className="eyebrow">Sprache · Language</p>
            <p className="mt-1.5 font-display text-lg font-medium">{t("select")}</p>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">{LANGUAGES.length} {t("languages")}</span>
        </div>
        <ul role="listbox" aria-label="Sprachen" className="grid max-h-[60vh] grid-cols-2 gap-px overflow-y-auto bg-border">
          {LANGUAGES.map((lang) => {
            const active = lang.code === current.code;
            return (
              <li key={lang.code} role="option" aria-selected={active} className="bg-surface-2">
                <button
                  type="button"
                  lang={lang.code}
                  dir={lang.rtl ? "rtl" : "ltr"}
                  onClick={() => choose(lang)}
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface",
                    active && "bg-primary/[0.07]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px] uppercase tracking-wider",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground group-hover:border-foreground/40",
                    )}
                  >
                    {lang.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm", active ? "font-medium text-foreground" : "text-foreground/90")}>
                      {lang.native}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground" dir="ltr">
                      {lang.label}
                    </span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-accent-ink" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-border px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("notice")}
        </p>
      </PopoverContent>
    </Popover>
  );
}

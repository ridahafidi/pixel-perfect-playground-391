import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Download } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/site";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { LanguagePicker } from "./LanguagePicker";

export function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[4.5rem] md:px-8">
        <Logo />

        <nav aria-label={t("home")} className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="relative rounded-md px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {({ isActive }) => (
                <>
                  {t(({"/":"home","/funktionen":"features","/download":"pricing","/bewertungen":"reviews"} as const)[item.to])}
                  <span
                    className={cn(
                      "absolute inset-x-3.5 -bottom-px h-px origin-left bg-primary transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker className="hidden md:inline-flex" />
          <Button asChild variant="hero" size="sm" className="hidden h-9 px-4 tracking-wide sm:inline-flex">
            <Link to="/download">
              <Download />
              {t("download")}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-md border border-border lg:hidden"
                aria-label="Menü öffnen"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm border-border bg-background p-0 [&>button]:hidden">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Logo />
                <SheetClose asChild>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-md border border-border"
                    aria-label="Menü schließen"
                  >
                    <X className="size-5" />
                  </button>
                </SheetClose>
              </div>
              <nav aria-label="Mobile Navigation" className="flex flex-col p-5">
                {NAV_ITEMS.map((item, i) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: true }}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 border-b border-border py-5 font-display text-2xl font-medium text-muted-foreground transition-colors data-[status=active]:text-foreground"
                  >
                    <span className="font-mono text-xs text-accent-ink">0{i + 1}</span>
                    {item.label}
                  </Link>
                ))}
                <LanguagePicker full align="start" side="top" className="mt-8" />
                <Button asChild variant="hero" size="xl" className="mt-3">
                  <Link to="/download" onClick={() => setOpen(false)}>
                    <Download />
                    {t("download")}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

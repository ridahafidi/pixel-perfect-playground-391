import { AlertTriangle, FileCheck2, CircleDot } from "lucide-react";
import { AppWindow, DashboardScreen } from "@/components/mockup/AppWindow";

/** Animated hero dashboard with floating interface cards. */
export function HeroVisual() {
  return (
    <div className="relative">
      <div className="bg-glow absolute -inset-20 -z-10" aria-hidden="true" />
      <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <AppWindow active="dashboard" className="lg:-mr-24 xl:-mr-40">
          <DashboardScreen />
        </AppWindow>
        {/* scanning line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg lg:-mr-24 xl:-mr-40" aria-hidden="true">
          <div className="h-24 w-full animate-scan bg-gradient-to-b from-transparent via-primary/[0.05] to-transparent" />
        </div>
      </div>

      {/* Floating cards */}
      <div
        className="absolute -left-4 top-[58%] hidden w-56 animate-float rounded-md bg-surface p-3 shadow-float sm:block lg:-left-10"
        aria-hidden="true"
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-7 items-center justify-center rounded-sm bg-warning/15 text-warning">
            <AlertTriangle className="size-3.5" />
          </span>
          <div className="text-[11px]">
            <p className="font-medium">Mindestbestand erreicht</p>
            <p className="mt-0.5 text-muted-foreground">Bremsbeläge VA · 2 / 4 Stk.</p>
          </div>
        </div>
      </div>

      <div
        className="absolute -top-6 right-4 hidden w-52 animate-float-slow rounded-md bg-surface p-3 shadow-float sm:block lg:right-0"
        style={{ animationDelay: "1.2s" }}
        aria-hidden="true"
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-7 items-center justify-center rounded-sm bg-primary/15 text-primary">
            <FileCheck2 className="size-3.5" />
          </span>
          <div className="text-[11px]">
            <p className="font-medium">Auftrag → Rechnung</p>
            <p className="mt-0.5 font-mono text-muted-foreground">RE-2026-0142</p>
          </div>
        </div>
      </div>

      <div
        className="absolute -bottom-8 right-10 hidden w-48 animate-float rounded-md bg-surface p-3 shadow-float md:block"
        style={{ animationDelay: "2.4s" }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="flex size-7 items-center justify-center rounded-sm bg-surface-2 text-muted-foreground">
            <CircleDot className="size-3.5" />
          </span>
          <div>
            <p className="font-medium">Winterräder · R2-04</p>
            <p className="mt-0.5 text-muted-foreground">Profil 6,5 mm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

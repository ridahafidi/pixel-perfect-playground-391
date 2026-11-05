import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="6" className="fill-primary" />
      <path
        d="M9 8h3.4v6.6L18.6 8H23l-6.7 7.2L23.4 24h-4.3l-5-6.3-1.7 1.8V24H9z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="KFZ Faktura – zur Startseite"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-display text-[0.95rem] font-bold tracking-[0.14em]">
        KFZ <span className="text-accent-ink">FAKTURA</span>
      </span>
    </Link>
  );
}

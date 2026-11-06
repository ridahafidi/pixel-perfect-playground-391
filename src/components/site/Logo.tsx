import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="6" className="fill-primary" />
      <path
        d="M8 24V8h4l8 10V8h4v16h-4L12 14v10z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="NexaFlow – zur Startseite"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-display text-[0.95rem] font-bold tracking-[0.14em]">
        Nexa<span className="text-accent-ink">Flow</span>
      </span>
    </Link>
  );
}


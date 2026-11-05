import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Brotkrumen" className="mb-8">
      <ol className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <li>
          <Link to="/" className="transition-colors hover:text-foreground">
            Startseite
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3" />
        </li>
        <li aria-current="page" className="text-foreground">
          {current}
        </li>
      </ol>
    </nav>
  );
}

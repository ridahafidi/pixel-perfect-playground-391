import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "Kopieren", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("In die Zwischenablage kopiert");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Kopieren nicht möglich", { description: "Bitte markieren und manuell kopieren." });
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Kopiert" : label}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary hover:text-accent-ink",
        copied && "border-primary text-accent-ink",
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Kopiert" : label}
    </button>
  );
}

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";

const schema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(100),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an.").max(255),
  message: z.string().trim().min(10, "Bitte schreiben Sie mindestens 10 Zeichen.").max(2000),
  privacy: z.literal(true, { errorMap: () => ({ message: "Bitte stimmen Sie der Datenschutzerklärung zu." }) }),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

/**
 * Contact form with client-side validation. Message delivery is not connected
 * yet, so submission confirms honestly that nothing was sent.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [privacy, setPrivacy] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      company: fd.get("company") || undefined,
      email: fd.get("email"),
      message: fd.get("message"),
      privacy,
    });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      toast("Formular geprüft – Versand noch nicht aktiv", {
        description:
          "Der Nachrichtenversand wird nach Einrichtung der Kontaktadresse freigeschaltet. Ihre Angaben wurden nicht übertragen.",
      });
    }, 700);
  };

  const field = "mt-2 border-border bg-background/60 focus-visible:ring-primary";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="company">Werkstatt / Firma</Label>
          <Input id="company" name="company" autoComplete="organization" className={field} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">E-Mail *</Label>
        <Input id="email" name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} />
        {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="message">Ihre Nachricht *</Label>
        <Textarea id="message" name="message" rows={5} className={field} aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
      </div>
      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy"
            checked={privacy}
            onCheckedChange={(v) => setPrivacy(v === true)}
            className="mt-0.5 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Label htmlFor="privacy" className="text-sm font-normal leading-relaxed text-muted-foreground">
            Ich habe die{" "}
            <Link to="/datenschutz" className="text-foreground underline underline-offset-4 hover:text-accent-ink">
              Datenschutzerklärung
            </Link>{" "}
            gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage einverstanden.
          </Label>
        </div>
        {errors.privacy && <p className="mt-1.5 text-xs text-destructive">{errors.privacy}</p>}
      </div>
      <Button type="submit" variant="hero" size="xl" disabled={sending}>
        {sending ? <Loader2 className="animate-spin" /> : <Send />}
        {sending ? "Wird geprüft …" : "Nachricht senden"}
      </Button>
    </form>
  );
}

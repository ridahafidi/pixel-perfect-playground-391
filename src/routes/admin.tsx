import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  KeyRound,
  ShieldCheck,
  Monitor,
  Search,
  LogOut,
  Plus,
  Copy,
  RefreshCw,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRequestOrigin } from "@/lib/origin.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  loader: () => getRequestOrigin(),
  head: ({ loaderData }) => ({
    ...seo({
      path: "/admin",
      title: "License administration",
      description: "Manage customer licenses and device activations.",
      origin: loaderData,
    }),
    meta: [{ title: "License administration" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LicenseAdmin,
});
type License = {
  id: string;
  email: string;
  customer: string;
  status: string;
  key_hint: string;
  machine_hash: string | null;
  created_at: number;
  expires_at: number | null;
  last_seen_at: number | null;
  activated: boolean;
};
const messages: Record<string, string> = {
  "admin-login-required": "Please sign in to manage licenses.",
  "invalid-credentials": "The email or password is incorrect.",
  "email-already-licensed": "This email already has a license. Find it below to manage its access.",
  "key-already-used": "This key is already assigned to another license.",
  "key-must-be-at-least-24-characters":
    "Use at least 24 characters, or leave the key blank to generate a secure one.",
  "too-many-attempts": "Too many attempts. Please wait before trying again.",
  "csrf-rejected": "Your session needs refreshing. Reload this page.",
  "license-service-unavailable": "The license service cannot be reached. Please try again later.",
  "license-service-not-configured":
    "The license service has not been connected to this website yet.",
};
export function LicenseAdmin() {
  const [loading, setLoading] = useState(true),
    [session, setSession] = useState<{ email: string; csrf: string } | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState("");
  const [issued, setIssued] = useState<{ email: string; key: string } | null>(null),
    [notice, setNotice] = useState("");
  async function api(path: string, body?: unknown, csrf?: string) {
    const response = await fetch("/api/licensing" + path, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json().catch(() => ({ error: "License service is unavailable." }));
    if (!response.ok) {
      if (response.status === 401 && path !== "/admin/login") setSession(null);
      throw new Error(messages[data.error] || data.error || "Request failed.");
    }
    return data;
  }
  useEffect(() => {
    let active = true;
    api("/admin/me")
      .then((data) => {
        if (active) setSession(data);
      })
      .catch((e) => {
        if (active && !String(e.message).includes("Please sign in")) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function refresh() {
    const data = await api("/admin/licenses");
    setLicenses(data.licenses);
  }
  useEffect(() => {
    if (session) refresh().catch((e) => setError(e.message));
  }, [session]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      setSession(
        await api("/admin/login", { email: form.get("email"), password: form.get("password") }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const element = event.currentTarget,
      form = new FormData(element);
    setBusy(true);
    setError("");
    setNotice("");
    setIssued(null);
    try {
      const expiry = String(form.get("expires") || "");
      const data = await api(
        "/admin/licenses",
        {
          email: form.get("email"),
          customer: form.get("customer"),
          key: form.get("key"),
          expiresAt: expiry ? Math.floor(new Date(expiry + "T23:59:59Z").getTime() / 1000) : null,
        },
        session.csrf,
      );
      setIssued({ email: data.license.email, key: data.key });
      element.reset();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function action(license: License, kind: "reset" | "revoke" | "rotate") {
    if (!session) return;
    const text = {
      reset:
        "Release the activated machine? Current sessions will lose access and the key can activate a new machine.",
      revoke: "Revoke this license? The customer will lose access at the next server check.",
      rotate:
        "Replace this license key and invalidate current sessions? The activated machine stays assigned.",
    }[kind];
    if (!window.confirm(text)) return;
    setBusy(true);
    setError("");
    setNotice("");
    setIssued(null);
    try {
      const data = await api(`/admin/licenses/${license.id}/${kind}`, {}, session.csrf);
      if (data.key) setIssued({ email: license.email, key: data.key });
      setNotice(
        kind === "reset"
          ? "Machine released. The customer can activate a new computer."
          : kind === "revoke"
            ? "License revoked."
            : "License key replaced.",
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      await api("/admin/logout", {}, session.csrf);
      setSession(null);
      setLicenses([]);
      setIssued(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const active = licenses.filter(
    (l) => l.status === "ACTIVE" && (!l.expires_at || l.expires_at > Date.now() / 1000),
  );
  const filtered = licenses.filter((l) =>
    (l.email + " " + l.customer).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="min-h-[80vh] px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Private administration
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Customer access.</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Manage authorized emails, license keys, and the computer assigned to each customer.
            </p>
          </div>
          {session && (
            <Button variant="outline" onClick={logout} disabled={busy}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          )}
        </div>
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm"
          >
            {error}
          </div>
        )}
        {notice && (
          <p role="status" className="mb-6 rounded-lg border border-border p-4 text-sm">
            {notice}
          </p>
        )}
        {loading ? (
          <p role="status">Checking your session…</p>
        ) : !session ? (
          <form
            onSubmit={login}
            className="max-w-md space-y-5 rounded-xl border border-border bg-surface-2 p-7"
          >
            <h2 className="text-xl font-semibold">Admin sign in</h2>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input id="admin-email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">Signed in as {session.email}</p>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Customers", value: licenses.length, Icon: KeyRound },
                { label: "Active licenses", value: active.length, Icon: ShieldCheck },
                {
                  label: "Activated computers",
                  value: active.filter((l) => l.activated).length,
                  Icon: Monitor,
                },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="rounded-xl border border-border bg-surface-2 p-6">
                  <Icon className="mb-5 size-5 text-accent-ink" />
                  <p className="text-3xl font-semibold">{value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            {issued && (
              <div
                role="status"
                className="mb-8 rounded-xl border border-primary/50 bg-primary/5 p-6"
              >
                <h2 className="font-semibold">Save this key for {issued.email}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Shown only now. Deliver it securely to your customer; the database stores a hash.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <code className="break-all rounded bg-background p-3 text-sm">{issued.key}</code>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(issued.key);
                        setNotice("Key copied.");
                      } catch {
                        setError("Clipboard unavailable. Copy the displayed key manually.");
                      }
                    }}
                  >
                    <Copy className="mr-2 size-4" />
                    Copy key
                  </Button>
                  <Button variant="ghost" onClick={() => setIssued(null)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
            <form
              onSubmit={create}
              className="mb-10 rounded-xl border border-border bg-surface-2 p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold">Authorize a customer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use after confirming payment or to grant access manually. Each license allows one
                computer.
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer / workshop</Label>
                  <Input id="customer" name="customer" maxLength={200} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Authorized email</Label>
                  <Input id="customer-email" name="email" type="email" maxLength={254} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-key">Existing key (optional)</Label>
                  <Input
                    id="customer-key"
                    name="key"
                    type="password"
                    minLength={24}
                    maxLength={256}
                    autoComplete="off"
                    placeholder="Leave blank to generate a secure key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires">Expiry (optional, UTC)</Label>
                  <Input id="expires" name="expires" type="date" />
                </div>
              </div>
              <Button type="submit" className="mt-6" disabled={busy}>
                <Plus className="mr-2 size-4" />
                {busy ? "Saving…" : "Create license"}
              </Button>
            </form>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Licenses</h2>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  aria-label="Search customers or emails"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search email or customer"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Customer licenses and their activated computer
                </caption>
                <thead className="bg-surface-2">
                  <tr>
                    {["Customer", "Status", "Computer", "Key", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap p-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((l) => (
                    <tr key={l.id}>
                      <td className="p-4">
                        <p className="font-medium">{l.customer}</p>
                        <p className="mt-1 text-muted-foreground">{l.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="rounded border border-border px-2 py-1 text-xs">
                          {l.status === "REVOKED"
                            ? "Revoked"
                            : l.expires_at && l.expires_at < Date.now() / 1000
                              ? "Expired"
                              : "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <p>{l.activated ? "1 / 1 activated" : "Not activated"}</p>
                        {l.machine_hash && (
                          <code className="mt-1 block text-xs text-muted-foreground">
                            …{l.machine_hash.slice(-12)}
                          </code>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">•••• {l.key_hint}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || !l.activated || l.status !== "ACTIVE"}
                            onClick={() => action(l, "reset")}
                          >
                            <Monitor className="mr-1 size-3" />
                            Reset device
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || l.status !== "ACTIVE"}
                            onClick={() => action(l, "rotate")}
                          >
                            <RefreshCw className="mr-1 size-3" />
                            New key
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy || l.status !== "ACTIVE"}
                            onClick={() => action(l, "revoke")}
                          >
                            <Ban className="mr-1 size-3" />
                            Revoke
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="p-8 text-center text-muted-foreground">
                  {licenses.length
                    ? "No matching customers."
                    : "No licenses yet. Authorize your first customer above."}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LicenseAdmin } from "@/routes/admin";
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
describe("license administration UI", () => {
  it("requires admin login before showing customers and displays new key only after server authorization", async () => {
    const license = {
      id: "license-1",
      email: "buyer@example.test",
      customer: "Test workshop",
      status: "ACTIVE",
      key_hint: "abcdef",
      machine_hash: null,
      created_at: 1800000000,
      expires_at: null,
      last_seen_at: null,
      activated: false,
    };
    let created = false;
    const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/admin/me")) return json({ error: "admin-login-required" }, 401);
      if (url.endsWith("/admin/login"))
        return json({ email: "owner@example.test", csrf: "test-csrf" });
      if (url.endsWith("/admin/licenses") && options?.method === "POST") {
        expect(new Headers(options.headers).get("x-csrf-token")).toBe("test-csrf");
        created = true;
        return json({ license, key: "NXF-test-generated-key-for-customer" }, 201);
      }
      if (url.endsWith("/admin/licenses")) return json({ licenses: created ? [license] : [] });
      throw new Error("Unexpected API request");
    });
    vi.stubGlobal("fetch", fetcher);
    render(<LicenseAdmin />);
    await screen.findByRole("heading", { name: "Admin sign in" });
    expect(screen.queryByText("Authorize a customer")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Admin email"), {
      target: { value: "owner@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/ }));
    await screen.findByRole("heading", { name: "Authorize a customer" });
    fireEvent.change(screen.getByLabelText("Customer / workshop"), {
      target: { value: "Test workshop" },
    });
    fireEvent.change(screen.getByLabelText("Authorized email"), {
      target: { value: "buyer@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create license" }));
    await screen.findByText("NXF-test-generated-key-for-customer");
    await screen.findByText("Test workshop");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(() =>
      expect(screen.queryByText("NXF-test-generated-key-for-customer")).not.toBeInTheDocument(),
    );
  });
  it("shows a clear service configuration error instead of granting access", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ error: "license-service-not-configured" }, 503)),
    );
    render(<LicenseAdmin />);
    expect(await screen.findByRole("alert")).toHaveTextContent("has not been connected");
    expect(screen.queryByRole("heading", { name: "Authorize a customer" })).not.toBeInTheDocument();
  });
});

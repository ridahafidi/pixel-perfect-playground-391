import { afterEach, expect, it, vi } from "vitest";
import { proxyLicenseRequest } from "@/lib/license-proxy.server";
afterEach(() => vi.unstubAllGlobals());
it("fails closed when licensing service is unconfigured", async () => {
  const response = await proxyLicenseRequest(
    new Request("https://site.example/api/licensing/admin/me"),
    {},
  );
  expect(response.status).toBe(503);
});
it("forwards admin session headers and response cookies through the server", async () => {
  const mock = vi.fn(
    async () =>
      new Response('{"email":"admin@example.test"}', {
        headers: { "set-cookie": "nexaflow_admin=fixture; HttpOnly" },
      }),
  );
  vi.stubGlobal("fetch", mock);
  const response = await proxyLicenseRequest(
    new Request("https://site.example/api/licensing/admin/login", {
      method: "POST",
      headers: { origin: "https://site.example", "x-csrf-token": "fixture" },
      body: "{}",
    }),
    { LICENSE_API_ORIGIN: "https://api.example" },
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  expect(mock.mock.calls.length).toBe(1);
});
it("rejects oversized bodies before making an upstream request", async () => {
  const mock = vi.fn();
  vi.stubGlobal("fetch", mock);
  const response = await proxyLicenseRequest(
    new Request("https://site.example/api/licensing/admin/login", {
      method: "POST",
      body: "a".repeat(17000),
    }),
    { LICENSE_API_ORIGIN: "https://api.example" },
  );
  expect(response.status).toBe(413);
  expect(mock).not.toHaveBeenCalled();
});

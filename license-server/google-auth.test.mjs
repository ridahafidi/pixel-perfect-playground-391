import { test } from "node:test";
import assert from "node:assert/strict";
import { createLicenseServer } from "./server.mjs";
import { passwordHash } from "./security.mjs";

test("Google authentication HTTP integration", async (t) => {
  let now = 1800000000;
  const origin = "http://localhost:5173";
  let verifyCalls = 0;
  const { server } = createLicenseServer({
    database: ":memory:", origin, allowHttp: true, clock: () => now,
    jwtSecret: "s".repeat(64), adminEmail: "owner@example.test",
    adminPasswordHash: passwordHash("correct-password"),
    googleClientId: "test-client.apps.googleusercontent.com",
    googleVerifier: async (token, options) => {
      verifyCalls++;
      assert.equal(options.audience, "test-client.apps.googleusercontent.com");
      if (token !== "verified-token") throw Object.assign(new Error("invalid-google-id-token"), { status: 401 });
      return { googleSub: "12345678901234567890", email: "user@gmail.com", emailVerified: true };
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = "http://127.0.0.1:" + server.address().port + "/api/licensing";
  async function request(path, body, headers = {}) {
    const res = await fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: res.status, data: await res.json(), cookie: res.headers.get("set-cookie") };
  }
  assert.equal((await request("/google/me")).status, 401);
  assert.equal((await request("/google/login", { idToken: "verified-token" })).status, 403);
  assert.equal((await request("/google/login", { idToken: "forged" }, { origin })).status, 401);
  const login = await request("/google/login", { idToken: "verified-token" }, { origin });
  assert.equal(login.status, 200);
  assert.equal(login.data.email, "user@gmail.com");
  assert.match(login.cookie, /HttpOnly/);
  assert.match(login.cookie, /SameSite=Strict/);
  const cookie = login.cookie.split(";")[0];
  assert.equal((await request("/google/me", undefined, { cookie })).status, 200);
  assert.equal((await request("/admin/me", undefined, { cookie })).status, 401);
  assert.equal((await request("/google/logout", {}, { cookie, origin })).status, 403);
  assert.equal((await request("/google/logout", {}, { cookie, origin, "x-csrf-token": "wrong" })).status, 403);
  assert.equal((await request("/google/logout", {}, { cookie, origin, "x-csrf-token": login.data.csrf })).status, 200);
  assert.equal((await request("/google/me", undefined, { cookie })).status, 401);
  const second = await request("/google/login", { idToken: "verified-token" }, { origin });
  assert.equal(second.status, 200);
  now += 3601;
  assert.equal((await request("/google/me", undefined, { cookie: second.cookie.split(";")[0] })).status, 401);
  assert.equal(verifyCalls, 3);
});

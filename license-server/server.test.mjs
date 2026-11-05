import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign, createHmac } from "node:crypto";
import { createLicenseServer } from "./server.mjs";
import { passwordHash, canonicalProof, hash, signJwt } from "./security.mjs";
test("HTTP entitlement and device access pipeline", async (t) => {
  let now = 1800000000;
  const secret = "s".repeat(64),
    purchaseSecret = "p".repeat(64),
    origin = "http://localhost:5173";
  const { server, db } = createLicenseServer({
    database: ":memory:",
    origin,
    jwtSecret: secret,
    adminEmail: "owner@example.test",
    adminPasswordHash: passwordHash("correct-password"),
    purchaseSecret,
    allowHttp: true,
    clock: () => now,
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}/api/licensing`;
  let cookie, csrf, key, id, token;
  async function req(path, body, headers = {}) {
    const r = await fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: r.status, body: await r.json(), cookie: r.headers.get("set-cookie") };
  }
  const admin = (p, b) => req("/admin" + p, b, { cookie, origin, "x-csrf-token": csrf });
  function device(name) {
    const pair = generateKeyPairSync("ed25519");
    return {
      machineHash: hash(name),
      publicKey: pair.publicKey.export({ format: "pem", type: "spki" }),
      privateKey: pair.privateKey,
    };
  }
  const a = device("windows-one"),
    b = device("windows-two");
  async function proof(d, email, action = "activate") {
    const { body: c } = await req("/challenge", {});
    return {
      email,
      machineHash: d.machineHash,
      publicKey: d.publicKey,
      challengeId: c.id,
      nonce: c.nonce,
      signature: sign(
        null,
        Buffer.from(canonicalProof(c, action, email, d.machineHash, d.publicKey)),
        d.privateKey,
      ).toString("base64url"),
    };
  }
  const activate = async (d, email, key) => req("/activate", { ...(await proof(d, email)), key });
  const session = async (d, email, token) =>
    req("/session", await proof(d, email, "session"), { authorization: "Bearer " + token });
  await t.test("admin requires login", async () =>
    assert.equal((await req("/admin/licenses")).status, 401),
  );
  await t.test("cross-site login blocked", async () =>
    assert.equal(
      (await req("/admin/login", { email: "owner@example.test", password: "correct-password" }))
        .status,
      403,
    ),
  );
  await t.test("incorrect password rejected", async () =>
    assert.equal(
      (await req("/admin/login", { email: "owner@example.test", password: "wrong" }, { origin }))
        .status,
      401,
    ),
  );
  await t.test("admin signs in with HttpOnly cookie", async () => {
    const r = await req(
      "/admin/login",
      { email: "owner@example.test", password: "correct-password" },
      { origin },
    );
    assert.equal(r.status, 200);
    assert.match(r.cookie, /HttpOnly/);
    cookie = r.cookie.split(";")[0];
    csrf = r.body.csrf;
  });
  await t.test("CSRF required for mutations", async () =>
    assert.equal((await req("/admin/licenses", {}, { cookie, origin })).status, 403),
  );
  await t.test("create licensed email and hashed key", async () => {
    const r = await admin("/licenses", { email: "Buyer@Example.test", customer: "Test workshop" });
    assert.equal(r.status, 201);
    key = r.body.key;
    id = r.body.license.id;
    assert.equal(r.body.license.email, "buyer@example.test");
    assert.equal(r.body.license.key_hash, undefined);
    assert.notEqual(db.prepare("SELECT key_hash FROM licenses").get().key_hash, key);
  });
  await t.test("duplicate email rejected", async () =>
    assert.equal(
      (await admin("/licenses", { email: "buyer@example.test", customer: "Duplicate" })).status,
      409,
    ),
  );
  await t.test("wrong email rejected", async () =>
    assert.equal((await activate(a, "stranger@example.test", key)).status, 401),
  );
  await t.test("wrong key rejected", async () =>
    assert.equal((await activate(a, "buyer@example.test", "wrong")).status, 401),
  );
  await t.test("first Windows device activates", async () => {
    const r = await activate(a, "buyer@example.test", key);
    assert.equal(r.status, 200);
    token = r.body.token;
  });
  await t.test("authenticated device receives application access", async () => {
    const r = await session(a, "buyer@example.test", token);
    assert.equal(r.status, 200);
    assert.equal(r.body.email, "buyer@example.test");
    token = r.body.token;
  });
  await t.test("second machine denied same email and key", async () =>
    assert.equal((await activate(b, "buyer@example.test", key)).status, 409),
  );
  await t.test("copied session token denied on second machine", async () =>
    assert.equal((await session(b, "buyer@example.test", token)).status, 401),
  );
  await t.test("challenge cannot be replayed", async () => {
    const body = { ...(await proof(a, "buyer@example.test")), key };
    assert.equal((await req("/activate", body)).status, 200);
    assert.equal((await req("/activate", body)).status, 401);
  });
  await t.test("tampered JWT rejected", async () =>
    assert.equal((await session(a, "buyer@example.test", token.slice(0, -3) + "bad")).status, 401),
  );
  await t.test("JWT without expiration rejected", async () => {
    const c = JSON.parse(Buffer.from(token.split(".")[1], "base64url"));
    delete c.exp;
    assert.equal((await session(a, "buyer@example.test", signJwt(c, secret))).status, 401);
  });
  await t.test("machine hash alone cannot impersonate device", async () =>
    assert.equal(
      (
        await activate(
          { ...b, machineHash: a.machineHash, publicKey: a.publicKey },
          "buyer@example.test",
          key,
        )
      ).status,
      401,
    ),
  );
  await t.test("admin reset revokes old session", async () => {
    assert.equal((await admin("/licenses/" + id + "/reset", {})).status, 200);
    assert.equal((await session(a, "buyer@example.test", token)).status, 401);
  });
  await t.test("new machine activates after reset", async () => {
    const r = await activate(b, "buyer@example.test", key);
    assert.equal(r.status, 200);
    token = r.body.token;
  });
  await t.test("key rotation revokes old key/session", async () => {
    const r = await admin("/licenses/" + id + "/rotate", {});
    assert.equal(r.status, 200);
    assert.equal((await session(b, "buyer@example.test", token)).status, 401);
    assert.equal((await activate(b, "buyer@example.test", key)).status, 401);
    key = r.body.key;
    token = (await activate(b, "buyer@example.test", key)).body.token;
  });
  await t.test("revocation removes application access", async () => {
    assert.equal((await admin("/licenses/" + id + "/revoke", {})).status, 200);
    assert.equal((await session(b, "buyer@example.test", token)).status, 403);
    assert.equal((await activate(b, "buyer@example.test", key)).status, 403);
  });
  async function purchase(body, bad = false) {
    return req("/purchases", body, {
      "x-nexaflow-timestamp": String(now),
      "x-nexaflow-signature": bad
        ? "bad"
        : createHmac("sha256", purchaseSecret)
            .update(now + "." + JSON.stringify(body))
            .digest("hex"),
    });
  }
  const paid = {
    eventId: "event-1",
    orderId: "order-1",
    type: "paid",
    email: "paid@example.test",
    customer: "Paid customer",
  };
  let paidId, paidToken;
  await t.test("unsigned purchases rejected", async () =>
    assert.equal((await purchase(paid, true)).status, 401),
  );
  await t.test("signed purchase grants entitlement", async () => {
    const r = await purchase(paid);
    assert.equal(r.status, 200);
    paidId = r.body.license.id;
    paidToken = (await activate(a, paid.email, r.body.key)).body.token;
  });
  await t.test("purchase retries are idempotent", async () => {
    const r = await purchase(paid);
    assert.equal(r.body.licenseId, paidId);
    assert.equal(r.body.duplicate, true);
    assert.equal(r.body.key, undefined);
  });
  await t.test("refund revokes session", async () => {
    assert.equal(
      (await purchase({ eventId: "refund-1", orderId: "order-1", type: "refunded" })).status,
      200,
    );
    assert.equal((await session(a, paid.email, paidToken)).status, 403);
  });
  await t.test("simultaneous first activation permits one device", async () => {
    const r = await admin("/licenses", { email: "race@example.test", customer: "Race" });
    const results = await Promise.all([
      activate(a, "race@example.test", r.body.key),
      activate(b, "race@example.test", r.body.key),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  });
  await t.test("expired JWT rejected", async () => {
    const r = await admin("/licenses", { email: "expiry@example.test", customer: "Expiry" });
    const activated = await activate(a, "expiry@example.test", r.body.key);
    now += 901;
    assert.equal((await session(a, "expiry@example.test", activated.body.token)).status, 401);
  });
  await t.test("logout ends admin session", async () => {
    assert.equal((await admin("/logout", {})).status, 200);
    assert.equal((await admin("/licenses")).status, 401);
  });
});
